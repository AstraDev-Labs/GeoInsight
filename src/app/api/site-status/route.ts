import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';

// Public endpoint - no auth required so the client-side lockdown check can work
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const settings = await dataService.getSiteSettings();
        return NextResponse.json({
            lockdownMode: settings.lockdownMode || 'none',
            lockdownMessage: settings.lockdownMessage,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            }
        });
    } catch (error) {
        console.error('Failed to get site status:', error);
        return NextResponse.json({ lockdownMode: 'none' });
    }
}
