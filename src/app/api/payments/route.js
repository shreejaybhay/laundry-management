import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import User from '@/models/User';
import connectDB from '@/lib/db';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET: Fetch payment history
async function getPayments(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;
    const isAdminRequest = searchParams.get('admin') === 'true';

    // Build query based on user role
    const query = {};

    // If not admin, only show user's own payments
    if (req.user.role !== 'admin' || !isAdminRequest) {
      query.userId = new mongoose.Types.ObjectId(req.user.id);
    }

    // For admin revenue page, only show paid payments
    if (isAdminRequest && req.user.role === 'admin') {
      query.status = 'PAID';
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'orderId',
        select: 'services weight totalPrice'
      })
      .lean();

    const total = await Payment.countDocuments(query);

    const cleanPayments = payments.map(payment => {
      const services = payment.orderId?.services || [];
      return {
        id: payment._id.toString(),
        amount: payment.amount.toString(),
        method: payment.method,
        status: payment.status.toUpperCase(),
        createdAt: payment.createdAt,
        orderDetails: payment.orderId ? {
          services: payment.orderId.services || [],
          weight: payment.orderId.weight,
          totalPrice: payment.orderId.totalPrice,
          status: payment.orderId.status
        } : null
      };
    });

    return apiResponse({
      success: true,
      payments: cleanPayments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('GET payments error:', error);
    return apiResponse({
      success: false,
      error: 'Failed to fetch payments',
      details: error.message
    }, { status: 500 });
  }
}

// POST: Process payment
async function processPayment(req) {
  try {
    // Ensure request has proper headers
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return apiResponse({
        error: 'Content-Type must be application/json'
      }, { status: 400 });
    }

    const data = await req.json();
    const { orderId, method } = data;

    if (!orderId || !method) {
      return apiResponse({
        error: 'Order ID and payment method are required'
      }, { status: 400 });
    }

    // Convert method to uppercase and validate
    const paymentMethod = method.toUpperCase();
    const validMethods = ['COD', 'ONLINE'];
    if (!validMethods.includes(paymentMethod)) {
      return apiResponse({
        error: 'Invalid payment method. Use COD or ONLINE'
      }, { status: 400 });
    }

    await connectDB();

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return apiResponse({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return apiResponse({
        error: 'Not authorized to pay for this order'
      }, { status: 403 });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return apiResponse({
        error: 'Payment already exists for this order',
        payment: {
          id: existingPayment._id,
          status: existingPayment.status
        }
      }, { status: 400 });
    }

    // Handle Cash on Delivery
    if (paymentMethod === 'COD') {
      const payment = await Payment.create({
        orderId: order._id,
        userId: req.user.id,
        amount: order.totalPrice,
        method: paymentMethod,
        status: 'PENDING'
      });

      return apiResponse({
        success: true,
        message: 'COD payment registered successfully',
        payment: {
          id: payment._id,
          amount: payment.amount.toString(),
          method: payment.method,
          status: payment.status
        }
      });
    }

    // Handle Online Payment (Stripe)
    if (paymentMethod === 'ONLINE') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Order #${order._id}`,
              description: `Payment for laundry services`,
            },
            unit_amount: Math.round(parseFloat(order.totalPrice.toString()) * 100),
          },
          quantity: 1,
        }],
        customer_email: req.user.email,
        metadata: {
          orderId: order._id.toString(),
          userId: req.user.id,
        },
        success_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/payments/stripe/success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders/${order._id}?canceled=true`,
      });

      const payment = await Payment.create({
        orderId: order._id,
        userId: req.user.id,
        amount: order.totalPrice,
        method: paymentMethod,
        status: 'PENDING',
        stripeSessionId: session.id
      });

      return apiResponse({
        success: true,
        message: 'Stripe session created successfully',
        payment: {
          id: payment._id,
          amount: payment.amount.toString(),
          method: payment.method,
          status: payment.status
        },
        stripeSession: {
          id: session.id,
          url: session.url
        }
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    return apiResponse({
      error: 'Failed to process payment',
      details: error.message
    }, { status: 500 });
  }
}

// In the Stripe webhook handler or payment completion endpoint
async function handlePaymentSuccess(orderId, paymentId) {
  await Payment.findByIdAndUpdate(paymentId, {
    status: 'PAID',
    stripePaymentId: stripeEvent.data.object.payment_intent
  });

  // Update both status fields in the order
  await Order.findByIdAndUpdate(orderId, {
    $set: {
      status: 'processing',
      paymentStatus: 'paid'
    }
  });
}

export const POST = auth(processPayment);
export const GET = auth(getPayments);

