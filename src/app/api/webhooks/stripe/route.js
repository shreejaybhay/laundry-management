export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import connectDB from '@/lib/db';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return apiResponse({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return apiResponse({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Attempt database connection with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await connectDB();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          console.error('Failed to connect to database after 3 attempts:', error);
          return apiResponse({ error: 'Database connection failed' }, { status: 503 });
        }
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { orderId, userId } = session.metadata || {};

        if (!orderId) {
          console.error('Missing orderId in session metadata:', session.id);
          return apiResponse({ error: 'Missing order ID' }, { status: 400 });
        }

        // Find and update payment
        const payment = await Payment.findOne({ 
          stripeSessionId: session.id,
          status: { $ne: 'PAID' } 
        });
        
        if (!payment) {
          console.log('Payment already processed or not found:', session.id);
          return apiResponse({ message: 'Payment already processed' });
        }

        // Update payment status
        payment.status = 'PAID';
        payment.stripePaymentId = session.payment_intent;
        
        // Update metadata
        const metadataMap = new Map(payment.metadata || new Map());
        metadataMap.set('stripeSessionId', session.id);
        metadataMap.set('paymentCompleted', new Date().toISOString());
        payment.metadata = metadataMap;

        await payment.save();

        // Update order status
        await Order.findByIdAndUpdate(orderId, {
          status: 'processing',
          paymentStatus: 'paid'
        });

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { orderId, userId } = paymentIntent.metadata || {};

        if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
          const payment = await Payment.findOne({ stripePaymentId: paymentIntent.id });
          if (payment && payment.status !== 'PAID') {
            payment.status = 'PAID';
            await payment.save();

            const order = await Order.findById(orderId);
            if (order && order.userId.toString() === userId) {
              order.status = 'processing';
              order.paymentStatus = 'paid';
              await order.save();
            }
          }
        }
        break;
      }

      case 'charge.succeeded':
      case 'charge.updated': {
        const charge = event.data.object;
        const payment = await Payment.findOne({ 
          stripePaymentId: charge.payment_intent 
        });

        if (payment) {
          const metadataMap = new Map(payment.metadata); // Create from existing metadata
          metadataMap.set('chargeId', charge.id);
          metadataMap.set('chargeStatus', charge.status);
          payment.metadata = metadataMap;
          await payment.save();
        }
        break;
      }

      case 'payment_intent.created': {
        console.log('Payment intent created:', event.data.object.id);
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object;
        
        if (!charge.payment_intent) {
          console.error('No payment_intent in failed charge:', charge.id);
          return apiResponse({ 
            error: 'Missing payment intent' 
          }, { status: 400 });
        }

        const payment = await Payment.findOne({ 
          stripePaymentId: charge.payment_intent 
        });

        if (payment) {
          payment.status = 'FAILED';
          const metadataMap = new Map(payment.metadata); // Create from existing metadata
          metadataMap.set('failureReason', charge.failure_message || 'Unknown error');
          metadataMap.set('failureCode', charge.failure_code || 'unknown');
          payment.metadata = metadataMap;
          await payment.save();

          const order = await Order.findById(payment.orderId);
          if (order) {
            order.status = 'pending';
            await order.save();
          }
        }
        break;
      }

      default: {
        console.log('Unhandled event type:', event.type);
      }
    }

    return apiResponse({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return apiResponse({ 
      error: 'Webhook handler failed' 
    }, { status: 500 });
  }
}

export const preferredRegion = 'auto';
