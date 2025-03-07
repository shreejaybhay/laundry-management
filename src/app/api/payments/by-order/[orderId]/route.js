import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import connectDB from '@/lib/db';

async function getPaymentByOrder(req) {
  try {
    const orderId = req.url.split('/').pop();
    
    await connectDB();
    
    const payment = await Payment.findOne({ orderId })
      .populate({
        path: 'orderId',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email phone address'
        }
      })
      .lean();
    
    if (!payment) {
      return apiResponse({ 
        message: 'No payment found for this order',
        payment: null 
      });
    }

    // Clean up response
    const cleanPayment = {
      id: payment._id.toString(),
      orderId: payment.orderId._id.toString(),
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
      }),
      // Include order details
      orderDetails: {
        id: payment.orderId._id.toString(),
        services: payment.orderId.services || [],
        status: payment.orderId.status,
        totalPrice: payment.orderId.totalPrice,
        pickupAddress: payment.orderId.pickupAddress,
        deliveryAddress: payment.orderId.deliveryAddress,
        createdAt: payment.orderId.createdAt
      }
    };

    return apiResponse({ payment: cleanPayment });

  } catch (error) {
    console.error('Get payment by order error:', error);
    return apiResponse({ 
      error: 'Failed to fetch payment details' 
    }, { status: 500 });
  }
}

export const GET = auth(getPaymentByOrder);
