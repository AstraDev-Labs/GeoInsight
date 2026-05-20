import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { dataService } from '@/lib/data-service';
import { sendCommentVerificationEmail } from '@/lib/email-service';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VERIFICATION_TTL_MS = 15 * 60 * 1000;

const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: Request) {
    try {
        const body = await request.json() as {
            name?: string;
            email?: string;
            password?: string;
        };

        const name = (body.name || '').trim();
        const email = (body.email || '').trim().toLowerCase();
        const password = (body.password || '').trim();

        if (!name || name.length < 3 || name.length > 80) {
            return NextResponse.json({ error: 'Display name must be 3-80 characters' }, { status: 400 });
        }

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
        }

        if (!password || password.length < 8 || password.length > 128) {
            return NextResponse.json({ error: 'Password must be 8-128 characters' }, { status: 400 });
        }

        const existingByEmail = await dataService.getCommentUserByEmail(email);
        if (existingByEmail && existingByEmail.emailVerified) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        const existing = await dataService.getCommentUserByName(name);
        if (existing) {
            if (existing.email !== email) {
                return NextResponse.json({ error: 'An account with this display name already exists' }, { status: 409 });
            }
            if (existing.emailVerified) {
                return NextResponse.json({ error: 'This account already exists and is verified. Please sign in.' }, { status: 409 });
            }

            const code = generateVerificationCode();
            const codeHash = await bcrypt.hash(code, 10);
            await dataService.updateCommentUser({
                ...existing,
                passwordHash: await bcrypt.hash(password, 10),
                emailVerificationCodeHash: codeHash,
                emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS).toISOString(),
                emailVerified: false,
            });

            const sent = await sendCommentVerificationEmail(email, name, code);
            if (!sent) {
                return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
            }

            return NextResponse.json({
                verificationRequired: true,
                message: 'Verification code sent. Please verify your email to activate the account.',
            });
        }

        if (existingByEmail && existingByEmail.name !== name && existingByEmail.emailVerified) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        const code = generateVerificationCode();
        const codeHash = await bcrypt.hash(code, 10);
        const passwordHash = await bcrypt.hash(password, 10);
        await dataService.createCommentUser({
            name,
            email,
            passwordHash,
            role: 'user',
            emailVerified: false,
            emailVerificationCodeHash: codeHash,
            emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS).toISOString(),
        });

        const sent = await sendCommentVerificationEmail(email, name, code);
        if (!sent) {
            return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
        }

        return NextResponse.json({
            verificationRequired: true,
            message: 'Verification code sent. Please verify your email to activate the account.',
        });
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}
