import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const key = (process.env.INDEX_NOW_KEY || '').trim();
    const resolvedParams = await params;
    const requestedSlug = resolvedParams.slug;

    // Check if the requested URL is exactly [key].txt
    if (key && requestedSlug === `${key}.txt`) {
        return new NextResponse(key, {
            status: 200,
            headers: {
                'content-type': 'text/plain; charset=utf-8',
            },
        });
    }

    // Fallback to 404 for any other random root-level slugs
    return new NextResponse('Not Found', { status: 404 });
}
