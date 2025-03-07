import { apiResponse } from '@/lib/apiResponse';
import jwt from 'jsonwebtoken';

export function adminAuth(handler) {
  return async (request, context) => {
    try {
      // Get token from cookie or Authorization header
      const token = request.cookies.get('token')?.value || 
                   request.headers.get('authorization')?.split(' ')[1];

      if (!token) {
        return apiResponse(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || decoded.role !== 'admin') {
        return apiResponse(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      request.user = decoded;
      return handler(request, context);
    } catch (error) {
      console.error('Admin auth error:', error);
      return apiResponse(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}
