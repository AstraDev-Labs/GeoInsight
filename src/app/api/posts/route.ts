import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';

type CacheEntry = {
    data: unknown;
    expiresAt: number;
};

const POSTS_CACHE_TTL_MS = 30_000;
const postsCache = new Map<string, CacheEntry>();

export async function GET(request: Request) {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cacheKey = `posts:${status || 'all'}`;
    const now = Date.now();

    const cached = postsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
        const response = NextResponse.json(cached.data);
        const totalMs = Date.now() - startTime;
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        response.headers.set('X-Cache-Hit', '1');
        response.headers.set('X-Response-Time-Ms', String(totalMs));
        response.headers.set('Server-Timing', `total;dur=${totalMs}`);
        return response;
    }

    const dbStart = Date.now();
    const posts = await dataService.getPosts();
    const dbMs = Date.now() - dbStart;
    const filteredPosts = status ? posts.filter((post) => post.status === status) : posts;
    postsCache.set(cacheKey, {
        data: filteredPosts,
        expiresAt: now + POSTS_CACHE_TTL_MS,
    });

    const response = NextResponse.json(filteredPosts);
    const totalMs = Date.now() - startTime;
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    response.headers.set('X-Cache-Hit', '0');
    response.headers.set('X-Response-Time-Ms', String(totalMs));
    response.headers.set('Server-Timing', `total;dur=${totalMs},db;dur=${dbMs}`);
    if (totalMs > 400) {
        console.warn(`[perf] slow /api/posts response: ${totalMs}ms (db=${dbMs}ms, status=${status || 'all'})`);
    }
    return response;
}
