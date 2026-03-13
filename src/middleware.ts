import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ Skip sitemap and robots
    if (
        pathname.startsWith('/sitemap.xml') ||
        pathname.startsWith('/robots.txt')
    ) {
        return NextResponse.next();
    }

    // Protect all /admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('admin_token')?.value;

        // If it's the login page, allow access so they can log in
        if (pathname === '/admin') {
            // Still pass pathname header
            const response = NextResponse.next();
            response.headers.set('x-pathname', pathname);
            return response;
        }

        // For any sub-paths or protected admin areas, require a token
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            url.searchParams.set('auth_error', 'invalid_access');
            return NextResponse.redirect(url);
        }
    }

    // Also protect admin API routes from direct access without a token
    // (excluding login itself)
    if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return new NextResponse(
                JSON.stringify({ success: false, message: 'Invalid access' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            );
        }
    }

    // Pass the pathname to layout via headers for lockdown check
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
}

// Match all routes except static files and Next.js internals
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.svg|logo.svg|og-image.png|uploads/).*)',
    ],
};
