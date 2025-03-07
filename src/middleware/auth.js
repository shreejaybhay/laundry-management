import jwt from 'jsonwebtoken';
import { apiResponse } from '@/lib/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET;

export function auth(handler) {
  return async (req) => {
    try {
      // Get token from cookie or Authorization header
      const token = req.cookies.get('token')?.value || 
                   req.headers.get('authorization')?.split(' ')[1];

      if (!token) {
        return apiResponse(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify and decode the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Ensure we have a user ID
      if (!decoded.id) {
        console.error('Token missing user ID:', decoded);
        return apiResponse(
          { error: 'Invalid token format' },
          { status: 401 }
        );
      }

      // If no handler is provided, return the user data
      if (!handler) {
        return decoded;
      }

      // Attach user data to the request
      req.user = decoded;

      // Call the handler with the authenticated request
      return handler(req);
    } catch (error) {
      console.error('Authentication error:', error);
      return apiResponse(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}