import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';

export const PUT = auth(async (req) => {
  try {
    await connectDB();
    
    const { name, email, phone } = await req.json();
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return apiResponse(
          { error: 'Email is already taken' },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phone && { phone })
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return apiResponse(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return apiResponse({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return apiResponse(
      { error: error.message },
      { status: 500 }
    );
  }
});