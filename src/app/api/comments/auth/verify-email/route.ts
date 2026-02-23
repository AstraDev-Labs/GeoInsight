import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { generateCommentToken } from '@/lib/auth-util';
import { dataService } from '@/lib/data-service';

export async function POST(request: Request) {
    try {
        const body = await request.json() as {
            name?: string;
            email?: string;
            code?: string;
        };

        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const code = (body.code || '').trim();

        if (!name || !email || !code) {
            return NextResponse.json({ error: 'Name, email, and verification code are required' }, { status: 400 });
        }

        const user = await dataService.getCommentUserByName(name);
        if (!user || user.email !== email) {
            return NextResponse.json({ error: 'Account not found for provided name/email' }, { status: 404 });
        }

        if (user.emailVerified) {
            const response = NextResponse.json({ authenticated: true, role: user.role, name: user.name });
            response.cookies.set('comment_auth_token', generateCommentToken({
                name: user.name,
                role: user.role,
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
        }

        if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt) {
            return NextResponse.json({ error: 'No verification code found. Please sign up again.' }, { status: 400 });
        }

        if (new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) {
            return NextResponse.json({ error: 'Verification code has expired. Please sign up again to receive a new code.' }, { status: 400 });
        }

        const validCode = await bcrypt.compare(code, user.emailVerificationCodeHash);
        if (!validCode) {
            return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
        }

        const updatedUser = await dataService.updateCommentUser({
            ...user,
            emailVerified: true,
            emailVerificationCodeHash: undefined,
            emailVerificationExpiresAt: undefined,
        });

        const response = NextResponse.json({ authenticated: true, role: updatedUser.role, name: updatedUser.name });
        response.cookies.set('comment_auth_token', generateCommentToken({
            name: updatedUser.name,
            role: updatedUser.role,
            userId: updatedUser.userId,
            commenterKey: updatedUser.commenterKey,
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