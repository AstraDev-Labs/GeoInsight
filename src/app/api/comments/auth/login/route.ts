import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { generateCommentToken } from '@/lib/auth-util';
import { dataService } from '@/lib/data-service';

export async function POST(request: Request) {
    try {
        const body = await request.json() as {
            identifier?: string;
            name?: string;
            password?: string;
        };

        const identifier = (body.identifier || body.name || '').trim();
        const password = (body.password || '').trim();

        if (!identifier || identifier.length > 120) {
            return NextResponse.json({ error: 'Valid username or email is required' }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        const looksLikeEmail = identifier.includes('@');
        const user = looksLikeEmail
            ? await dataService.getCommentUserByEmail(identifier)
            : await dataService.getCommentUserByName(identifier);
        if (!user) {
            return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.emailVerified) {
            return NextResponse.json({ error: 'Email not verified. Verify your email before signing in.' }, { status: 403 });
        }

        const role = user.role === 'admin' || user.role === 'bot' ? user.role : 'user';

        const response = NextResponse.json({ authenticated: true, role, name: user.name });

        response.cookies.set('comment_auth_token', generateCommentToken({
            name: user.name,
            role,
            userId: user.userId,
            commenterKey: user.commenterKey,
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}
