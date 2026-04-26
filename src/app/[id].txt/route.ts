import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const key = (process.env.INDEX_NOW_KEY || '').trim();
    const resolvedParams = await params;
    const requestedId = resolvedParams.id;

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
