import { NextResponse } from 'next/server';
import { dataService } from '@/lib/data-service';
import type { LockdownMode } from '@/lib/types';

export async function GET() {
    try {
        const settings = await dataService.getSiteSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to get site settings:', error);
        return NextResponse.json({ error: 'Failed to load site settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lockdownMode, lockdownMessage } = body;

        const validModes: LockdownMode[] = ['none', 'maintenance', 'technical_difficulties'];
        if (lockdownMode && !validModes.includes(lockdownMode)) {
            return NextResponse.json({ error: 'Invalid lockdown mode' }, { status: 400 });
        }

        const updated = await dataService.saveSiteSettings({
            ...(lockdownMode !== undefined && { lockdownMode }),
            ...(lockdownMessage !== undefined && { lockdownMessage }),
        });

        return NextResponse.json({ success: true, settings: updated });
    } catch (error) {
        console.error('Failed to save site settings:', error);
        return NextResponse.json({ error: 'Failed to save site settings' }, { status: 500 });
    }
}
