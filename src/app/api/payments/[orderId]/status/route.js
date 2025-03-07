import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import connectDB from '@/lib/db';

export async function PUT(req, { params }) {
  try {
    const { orderId } = params;
    const { status } = await req.json();

    if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) {
      return apiResponse({ 
        error: 'Invalid payment status' 
      }, { status: 400 });
    }

    await connectDB();

    // Find the payment
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return apiResponse({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Update payment status
    payment.status = status;
    await payment.save();

    // If payment is marked as PAID, update both status fields in the order
    if (status === 'PAID') {
      await Order.findByIdAndUpdate(orderId, {
        $set: { 
          status: 'processing',
          paymentStatus: 'paid'
        }
      });
    }

    return apiResponse({
      message: 'Payment status updated successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    return apiResponse({ 
      error: 'Failed to update payment status' 
    }, { status: 500 });
  }
}
