import { auth } from '@/middleware/auth';
import { apiResponse } from '@/lib/apiResponse';
import User from '@/models/User';
import connectDB from '@/lib/db';

export const GET = auth(async (req) => {
  try {
    await connectDB();
    
    // Fetch complete user data including name
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return apiResponse(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return apiResponse({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    return apiResponse(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    );
  }
});
