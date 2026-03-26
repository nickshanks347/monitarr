import { NextRequest, NextResponse } from 'next/server';

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform a dummy loop to avoid leaking length via timing
    let dummy = 0;
    for (let i = 0; i < bufA.length; i++) {
      dummy |= bufA[i] ^ bufA[i];
    }
    void dummy;
    return false;
  }
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

function isAuthenticated(request: NextRequest): boolean {
  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

  // Both must be set to enable authentication
  if (!authUsername && !authPassword) {
    return true;
  }

  if (!authUsername || !authPassword) {
    console.warn(
      'monitarr: AUTH_USERNAME and AUTH_PASSWORD must both be set to enable authentication. ' +
      'Authentication is currently disabled.'
    );
    return true;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const base64Credentials = authHeader.slice('Basic '.length);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) {
      return false;
    }
    const username = credentials.slice(0, colonIndex);
    const password = credentials.slice(colonIndex + 1);

    return timingSafeStringEqual(username, authUsername) && timingSafeStringEqual(password, authPassword);
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  // Check authentication before processing any request
  if (!isAuthenticated(request)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="monitarr"',
      },
    });
  }

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