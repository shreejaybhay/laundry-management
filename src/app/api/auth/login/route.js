import { NextResponse } from 'next/server';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req) {
  try {
    // Set a timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 8000); // 8 second timeout
    });

    const loginPromise = async () => {
      await connectDB();
      
      const { email, password } = await req.json();

      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        {
          success: true,
          user: { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role
          }
        },
        { status: 200 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800
      });

      return response;
    };

    // Race between timeout and login operation
    return await Promise.race([loginPromise(), timeoutPromise]);
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific timeout error
    if (error.message === 'Request timeout') {
      return NextResponse.json(
        { error: 'Login request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
