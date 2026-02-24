import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const userAgent = request.headers.get('user-agent') || '';

    // Protected routes configuration
    // (Bots can still be detected here if needed in the future)

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
            return NextResponse.next();
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

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*', '/robots.txt', '/sitemap.xml'],
};
