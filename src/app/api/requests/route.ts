import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { PostRequest } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { sendSubmissionReceivedEmail } from '@/lib/email-service';
import { invalidateRequestsCache } from '@/lib/api-cache';

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const dbStart = Date.now();
    const requests = await dataService.getRequests();
    const dbMs = Date.now() - dbStart;
    const filteredRequests = status ? requests.filter((entry) => entry.status === status) : requests;

    const response = NextResponse.json(filteredRequests);
    const totalMs = Date.now() - startTime;
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Cache-Hit', '0');
    response.headers.set('X-Response-Time-Ms', String(totalMs));
    response.headers.set('Server-Timing', `total;dur=${totalMs},db;dur=${dbMs}`);
    if (totalMs > 400) {
        console.warn(`[perf] slow /api/requests response: ${totalMs}ms (db=${dbMs}ms, status=${status || 'all'})`);
    }
    return response;
}

import { verifyTurnstileToken } from "@/lib/turnstile-util";

export async function POST(request: Request) {
    const data = await request.json();

    // DEBUG BYPASS: Temporarily allowing all requests to debug D1 and SMTP
    const isHuman = true;
    if (!isHuman) {
        return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
    }

    let hashedPassword = undefined;
    if (data.authorPassword) {
        hashedPassword = await bcrypt.hash(data.authorPassword, 10);
    }

    const newRequest: PostRequest = {
        ...data,
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        submittedAt: new Date().toISOString(),
        status: 'pending',
    };

    if (hashedPassword) {
        newRequest.authorPassword = hashedPassword;
    }

    await dataService.addRequest(newRequest);
    invalidateRequestsCache();

    // Send confirmation email and wait for completion.
    // In serverless runtimes, fire-and-forget can be terminated before SMTP finishes.
    if (data.email && data.author && data.title) {
        try {
            const sent = await sendSubmissionReceivedEmail(data.email, data.author, data.title);
            if (!sent) {
                console.warn('Submission confirmation email was not sent (SMTP skipped or failed).', {
                    to: data.email,
                    title: data.title,
                });
            }
        } catch (err) {
            console.error('Failed to send submission confirmation email:', err);
        }
    }

    return NextResponse.json(newRequest);
}
