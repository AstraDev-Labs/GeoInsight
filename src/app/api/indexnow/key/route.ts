import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const key = (process.env.INDEX_NOW_KEY || '').trim();

    if (!key) {
        return new NextResponse('INDEX_NOW_KEY is not configured', {
            status: 404,
            headers: { 'content-type': 'text/plain; charset=utf-8' },
        });
    }

    return new NextResponse(key, {
        status: 200,
        headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'public, max-age=300, stale-while-revalidate=600',
        },
    });
}
