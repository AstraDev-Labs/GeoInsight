import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth-util';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "Astradevs@2026").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dataService.clearHistory();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("API Error in clear-history:", err);
        return NextResponse.json({ success: false, error: err.message || 'Failed to clear history internally' }, { status: 500 });
    }
}
