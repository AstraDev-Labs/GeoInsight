import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyAdminToken, verifyCommentToken } from '@/lib/auth-util';

export async function GET() {
    const cookieStore = await cookies();

    const commentToken = cookieStore.get('comment_auth_token')?.value;
    const commentSession = verifyCommentToken(commentToken);

    if (commentSession) {
        return NextResponse.json({
            authenticated: true,
            role: commentSession.role,
            name: commentSession.name,
        });
    }

    const adminToken = cookieStore.get('admin_token')?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (verifyAdminToken(adminToken, adminPassword)) {
        return NextResponse.json({
            authenticated: true,
            role: 'admin',
            name: 'Admin',
        });
    }

    return NextResponse.json({
        authenticated: false,
        role: null,
        name: null,
    });
}