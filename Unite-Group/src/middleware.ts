// Temporarily disable all middleware to test basic functionality
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Just pass through without any processing
  return NextResponse.next();
}

export const config = {
  // Don't match any paths for now
  matcher: []
};
