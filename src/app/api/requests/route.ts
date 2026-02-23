import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { PostRequest } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { sendSubmissionReceivedEmail } from '@/lib/email-service';

type CacheEntry = {
    data: unknown;
    expiresAt: number;
};

const REQUESTS_CACHE_TTL_MS = 15_000;
const requestsCache = new Map<string, CacheEntry>();

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cacheKey = `requests:${status || 'all'}`;
    const now = Date.now();

    const cached = requestsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
        const response = NextResponse.json(cached.data);
        const totalMs = Date.now() - startTime;
        response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
        response.headers.set('X-Cache-Hit', '1');
        response.headers.set('X-Response-Time-Ms', String(totalMs));
        response.headers.set('Server-Timing', `total;dur=${totalMs}`);
        return response;
    }

    const dbStart = Date.now();
    const requests = await dataService.getRequests();
    const dbMs = Date.now() - dbStart;
    const filteredRequests = status ? requests.filter((entry) => entry.status === status) : requests;
    requestsCache.set(cacheKey, {
        data: filteredRequests,
        expiresAt: now + REQUESTS_CACHE_TTL_MS,
    });

    const response = NextResponse.json(filteredRequests);
    const totalMs = Date.now() - startTime;
    response.headers.set('Cache-Control', 'private, max-age=15, stale-while-revalidate=60');
    response.headers.set('X-Cache-Hit', '0');
    response.headers.set('X-Response-Time-Ms', String(totalMs));
    response.headers.set('Server-Timing', `total;dur=${totalMs},db;dur=${dbMs}`);
    if (totalMs > 400) {
        console.warn(`[perf] slow /api/requests response: ${totalMs}ms (db=${dbMs}ms, status=${status || 'all'})`);
    }
    return response;
}

export async function POST(request: Request) {
    const data = await request.json();

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

    // Send confirmation email (non-blocking)
    if (data.email && data.author && data.title) {
        sendSubmissionReceivedEmail(data.email, data.author, data.title).catch(err => {
            console.error('Failed to send submission confirmation email:', err);
        });
    }

    return NextResponse.json(newRequest);
}
