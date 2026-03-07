import { NextResponse } from 'next/server';


export function middleware() {
    // Root route '/' will now render the marketing landing page.
    // Auth redirection for authenticated users navigating to '/' is handled by AuthProvider.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
