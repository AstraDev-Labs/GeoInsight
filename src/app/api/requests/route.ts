import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { PostRequest } from '@/lib/types';
import bcrypt from 'bcryptjs';
import { sendSubmissionReceivedEmail } from '@/lib/email-service';

export async function GET() {
    const requests = await dataService.getRequests();
    return NextResponse.json(requests);
}

export async function POST(request: Request) {
    const data = await request.json();

    let hashedPassword = undefined;
    if (data.authorPassword) {
        hashedPassword = await bcrypt.hash(data.authorPassword, 10);
    }

    const newRequest: PostRequest = {
        ...data,
        id: 'req-' + Math.random().toString(36).substr(2, 9),
        submittedAt: new Date().toISOString(),
        status: 'pending',
    };

    if (hashedPassword) {
        newRequest.authorPassword = hashedPassword;
    }

    await dataService.addRequest(newRequest);

    // Send confirmation email (non-blocking)
    if (data.email && data.author && data.title) {
        sendSubmissionReceivedEmail(data.email, data.author, data.title).catch(err => {
            console.error('Failed to send submission confirmation email:', err);
        });
    }

    return NextResponse.json(newRequest);
}
