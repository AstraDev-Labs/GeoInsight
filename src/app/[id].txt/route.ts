import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const key = (process.env.INDEX_NOW_KEY || '').trim();
    const requestedId = (await params).id;

    // Only respond if the requested filename matches our key
    if (key && requestedId === key) {
        return new NextResponse(key, {
            status: 200,
            headers: {
                'content-type': 'text/plain; charset=utf-8',
            },
        });
    }

    return new NextResponse('Not Found', { status: 404 });
}
