import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyAdminToken } from '@/lib/auth-util';
import { dataService } from '@/lib/data-service';

const isAuthorized = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    return verifyAdminToken(token, adminPassword);
};

export async function GET() {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await dataService.getBotSettings();
    return NextResponse.json(settings);
}

export async function PUT(request: Request) {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as {
            autoModerationEnabled?: boolean;
            violationTerms?: string[];
            severeTerms?: string[];
            violationMuteHours?: number;
            autoBanOnSevere?: boolean;
        };

        const settings = await dataService.saveBotSettings({
            autoModerationEnabled: body.autoModerationEnabled,
            violationTerms: Array.isArray(body.violationTerms)
                ? body.violationTerms.map((term) => term.trim()).filter(Boolean)
                : undefined,
            severeTerms: Array.isArray(body.severeTerms)
                ? body.severeTerms.map((term) => term.trim()).filter(Boolean)
                : undefined,
            violationMuteHours: typeof body.violationMuteHours === 'number' ? body.violationMuteHours : undefined,
            autoBanOnSevere: body.autoBanOnSevere,
        });

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
}