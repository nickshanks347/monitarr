/**
 * Get the base path from environment variable
 * This is used to support hosting the app in a subfolder
 */
export function getBasePath(): string {
  // On the client side, we can get the base path from the environment
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }
  
  // On the server side, use the environment variable
  return process.env.BASE_PATH || '';
}

/**
 * Create a URL that respects the base path configuration
 */
export function createUrl(path: string): string {
  const basePath = getBasePath();
  
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If no base path, just return the path with leading slash
  if (!basePath) {
    return `/${cleanPath}`;
  }
  
  // Combine base path with the route path
  return `${basePath}/${cleanPath}`;
}

/**
 * Get the current base path for client-side usage
 * This extracts the base path from the current URL
 */
export function getCurrentBasePath(): string {
  if (typeof window === 'undefined') {
    return getBasePath();
  }
  
  const pathname = window.location.pathname;
  
  // Known application routes - adjust these based on your app structure
  const appRoutes = ['/', '/api'];
  
  // Check if current path contains any known route
  for (const route of appRoutes) {
    const routeIndex = pathname.indexOf(route);
    if (routeIndex > 0) {
      return pathname.substring(0, routeIndex);
    }
  }
  
  // If we're at root and there might be a base path
  if (pathname !== '/') {
    // Check if this could be a base path by looking for common patterns
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) {
      return `/${segments[0]}`;
    }
  }
  
  return '';
}