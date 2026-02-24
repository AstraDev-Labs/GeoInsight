import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const dbStart = Date.now();
    const posts = await dataService.getPosts();
    const dbMs = Date.now() - dbStart;
    const filteredPosts = status ? posts.filter((post) => post.status === status) : posts;

    const response = NextResponse.json(filteredPosts);
    const totalMs = Date.now() - startTime;
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Cache-Hit', '0');
    response.headers.set('X-Response-Time-Ms', String(totalMs));
    response.headers.set('Server-Timing', `total;dur=${totalMs},db;dur=${dbMs}`);
    if (totalMs > 400) {
        console.warn(`[perf] slow /api/posts response: ${totalMs}ms (db=${dbMs}ms, status=${status || 'all'})`);
    }
    return response;
}
