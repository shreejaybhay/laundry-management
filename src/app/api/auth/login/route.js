import { NextResponse } from 'next/server';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';

export async function POST(req) {
  try {
    await connectDB();
    
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
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
          role: user.role  // Make sure this is included
        }
      },
      { status: 200 }
    );

    // Set the cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800 // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
