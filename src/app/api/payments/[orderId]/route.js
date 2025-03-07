import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

async function getPayment(req) {
  try {
    const paymentId = req.url.split('/').pop();

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return apiResponse({ 
        error: 'Invalid payment ID format' 
      }, { status: 400 });
    }

    await connectDB();
    
    // Look up payment by either _id or orderId and populate user details
    const payment = await Payment.findOne({
      $or: [
        { _id: paymentId },
        { orderId: paymentId }
      ]
    }).populate({
      path: 'orderId',
      populate: {
        path: 'userId',
        model: 'User',
        select: 'name email phone address'
      }
    });
    
    if (!payment) {
      console.log('No payment found for ID:', paymentId);
      return apiResponse({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Check if user is authorized
    if (payment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return apiResponse({ 
        error: 'Not authorized to view this payment' 
      }, { status: 403 });
    }

    // Clean up response
    const cleanPayment = {
      id: payment._id,
      orderId: payment.orderId._id,
      amount: payment.amount.toString(),
      method: payment.method,
      status: payment.status,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      // Customer information
      customerName: payment.orderId?.userId?.name || 'N/A',
      customerEmail: payment.orderId?.userId?.email || 'N/A',
      customerPhone: payment.orderId?.userId?.phone || 'N/A',
      customerAddress: payment.orderId?.userId?.address || 'N/A',
      // Include additional fields for online payments
      ...(payment.method === 'ONLINE' && {
        stripeSessionId: payment.stripeSessionId,
        stripePaymentId: payment.stripePaymentId,
        cardLast4: payment.cardLast4
      })
    };

    return apiResponse({ payment: cleanPayment });

  } catch (error) {
    console.error('Get payment error:', error);
    return apiResponse({ 
      error: 'Failed to fetch payment details' 
    }, { status: 500 });
  }
}

export const GET = auth(getPayment);
