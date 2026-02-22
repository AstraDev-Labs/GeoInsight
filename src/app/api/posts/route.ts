import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';

export async function GET() {
    const posts = await dataService.getPosts();
    return NextResponse.json(posts);
}
