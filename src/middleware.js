import { NextResponse } from "next/server";

// Define protected paths
const adminPaths = [
  '/dashboard/revenue',
  '/dashboard/orders/manage',
  '/dashboard/users',
  '/dashboard/settings/admin'
];

const userOnlyPaths = [
  '/dashboard/history',
  '/dashboard/profile',
  '/dashboard/orders/new'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  // Stripe success and webhook routes should bypass middleware completely
  if (pathname.startsWith('/api/webhooks/stripe') || 
      pathname.startsWith('/api/payments/stripe/success')) {
    return NextResponse.next();
  }

  // Allow authentication-related API routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // For other API routes, check authentication
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get("token");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("token");

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some(path => pathname === path);

  // If has token and trying to access root path or public paths, redirect to dashboard
  if (token && (pathname === "/" || isPublicPath)) {
    return NextResponse.redirect(new URL("/dashboard", BASE_URL));
  }

  // If no token and not a public path or root path, redirect to login
  if (!token && !isPublicPath && pathname !== "/") {
    const from = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?from=${from}`, BASE_URL));
  }

  // Get user role from token
  let userRole = 'user';
  try {
    if (token) {
      const tokenData = JSON.parse(atob(token.value.split('.')[1]));
      userRole = tokenData.role;
    }
  } catch (error) {
    // If token is invalid, redirect to login
    const loginUrl = new URL("/login", BASE_URL);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if current path is admin-only or user-only
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  const isUserOnlyPath = userOnlyPaths.some(path => pathname.startsWith(path));

  // For admin paths, verify admin status
  if (isAdminPath && userRole !== 'admin') {
    return NextResponse.redirect(new URL("/dashboard", BASE_URL));
  }

  // For user-only paths, redirect admins to appropriate admin page
  if (isUserOnlyPath && userRole === 'admin') {
    if (pathname.startsWith('/dashboard/history')) {
      return NextResponse.redirect(new URL("/dashboard/orders/manage", BASE_URL));
    }
    return NextResponse.redirect(new URL("/dashboard/revenue", BASE_URL));
  }

  return NextResponse.next();
}

// Configure the paths that should be handled by the middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
};
