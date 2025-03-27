import { adminAuth } from '@/middleware/adminAuth';
import { apiResponse } from '@/lib/apiResponse';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

async function updateOrderStatus(request, context) {
  try {
    const { id } = context.params;
    const { status } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return apiResponse({ error: 'Invalid order ID format' }, { status: 400 });
    }

    // Update valid statuses to match frontend options
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status?.toLowerCase())) {
      return apiResponse({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return apiResponse({ error: 'Order not found' }, { status: 404 });
    }

    // Don't allow status updates for cancelled orders
    if (order.status === 'cancelled') {
      return apiResponse({ 
        error: 'Cannot update status of cancelled order' 
      }, { status: 400 });
    }

    // Modified validation: Check payment method and status
    if (status === 'delivered') {
      const payment = await Payment.findOne({ orderId: id });
      // Allow delivery if it's COD or if payment is not pending
      if (!payment || (payment.method !== 'COD' && order.paymentStatus === 'unpaid')) {
        return apiResponse({ 
          error: 'Cannot mark order as delivered when payment is pending' 
        }, { status: 400 });
      }
    }

    // If marking as delivered, ensure payment status is updated
    const updateData = { 
      status: status.toLowerCase(),
      updatedAt: new Date()
    };
    
    if (status === 'delivered') {
      updateData.paymentStatus = 'paid';
      // Update payment status for COD
      const payment = await Payment.findOne({ orderId: id });
      if (payment && payment.method === 'COD') {
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'PAID'
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return apiResponse({
      message: 'Order status updated successfully',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return apiResponse({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export const PUT = adminAuth(updateOrderStatus);


