import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendPublishedEmail, sendDeclinedEmail } from '@/lib/email-service';

export async function POST(request: Request) {
    // Verify admin authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const tokens = (globalThis as any).__adminTokens || {};
    const isAdmin = token && tokens[token] && Date.now() < tokens[token];

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { type, authorEmail, authorName, postTitle, postId, reason } = await request.json();

        if (!authorEmail || !authorName || !postTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let success = false;

        if (type === 'published') {
            success = await sendPublishedEmail(authorEmail, authorName, postTitle, postId);
        } else if (type === 'declined') {
            success = await sendDeclinedEmail(authorEmail, authorName, postTitle, reason);
        } else {
            return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
        }

        return NextResponse.json({ success, message: success ? 'Email sent' : 'Email skipped (SMTP not configured)' });
    } catch (error) {
        console.error('Notification error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
}
