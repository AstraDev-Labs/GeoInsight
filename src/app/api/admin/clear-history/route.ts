import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth-util';
import { invalidatePostsCache, invalidateRequestsCache } from '@/lib/api-cache';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dataService.clearHistory();
        invalidatePostsCache();
        invalidateRequestsCache();
        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to clear history internally';
        console.error("API Error in clear-history:", err);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
