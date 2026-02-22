import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const tokens = (globalThis as any).__adminTokens || {};
    const isAdmin = token && tokens[token] && Date.now() < tokens[token];

    if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dataService.clearHistory();
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Failed to clear history' }, { status: 500 });
    }
}
