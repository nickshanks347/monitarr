import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const basePath = process.env.BASE_PATH || '';
  
  // If no base path is configured, proceed normally
  if (!basePath) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  
  // Skip middleware for static files and internal Next.js routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Handle requests that already include the base path
  if (url.pathname.startsWith(basePath)) {
    // Remove the base path from the pathname for internal routing
    const newPathname = url.pathname.slice(basePath.length) || '/';
    url.pathname = newPathname;
    return NextResponse.rewrite(url);
  }
  
  // Handle API routes - they should work under base path
  if (url.pathname.startsWith('/api')) {
    // Rewrite API calls to work under base path
    return NextResponse.next();
  }
  
  // For all other routes (including root), redirect to include base path
  if (!url.pathname.startsWith(basePath)) {
    url.pathname = basePath + url.pathname;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};