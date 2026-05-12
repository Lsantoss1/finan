import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/auth';

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  if (request.method !== 'GET' && request.url.includes('/api/webhooks')) {
    return NextResponse.next();
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
