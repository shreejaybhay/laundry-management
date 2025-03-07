import { redirect } from 'next/navigation';
import { apiResponse } from '@/lib/apiResponse';
import Payment from '@/models/Payment';
import Order from '@/models/Order';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import { SignJWT } from 'jose';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');

  if (!sessionId || !orderId) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders?error=invalid_parameters`
    );
  }

  try {
    await connectDB();

    // Verify the session with Stripe and get payment details in parallel
    const [session, payment] = await Promise.all([
      stripe.checkout.sessions.retrieve(sessionId),
      Payment.findOne({ 
        stripeSessionId: sessionId,
        orderId: orderId
      }).exec()
    ]);
    
    if (!session || session.payment_status !== 'paid') {
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders/${orderId}?error=payment_incomplete`
      );
    }

    if (!payment) {
      console.error('Payment not found:', sessionId);
      return Response.redirect(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders/${orderId}?error=payment_not_found`
      );
    }

    // Find the user
    const user = await User.findById(payment.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (payment.status !== 'PAID') {
      // Update payment and order status in parallel
      await Promise.all([
        Payment.findByIdAndUpdate(payment._id, {
          status: 'PAID',
          stripePaymentId: session.payment_intent,
          metadata: {
            ...payment.metadata,
            stripeSessionId: sessionId,
            paymentCompleted: new Date().toISOString()
          }
        }),
        Order.findByIdAndUpdate(orderId, {
          status: 'processing',
          paymentStatus: 'paid'
        })
      ]);
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Create the redirect URL with success parameter
    const redirectUrl = new URL(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders/${orderId}`);
    redirectUrl.searchParams.set('success', 'true');

    // Set both the auth token and a success message
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Set-Cookie': [
          `token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
          `payment_success=true; Path=/; Max-Age=60` // Short-lived cookie for success message
        ].join(', ')
      }
    });

    return response;

  } catch (error) {
    console.error('Payment success handler error:', error);
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_FRONTEND_URL}/dashboard/orders/${orderId}?error=unknown`
    );
  }
}
