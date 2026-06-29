import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get API path
// This function ensures the path includes the basePath when set
// Note: For client-side fetch requests, we need to manually prepend basePath
// Next.js only automatically handles basePath for internal routing, not fetch requests
export function getApiPath(path: string): string {
  // Get basePath from environment variable (available at build time for NEXT_PUBLIC_* vars)
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Ensure path starts with '/'
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Prepend basePath if it's set
  // basePath should already start with '/' (e.g., '/camera-float-ntu')
  return basePath ? `${basePath}${cleanPath}` : cleanPath;
}

