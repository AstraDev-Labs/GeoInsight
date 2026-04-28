import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { BlogPost } from '@/lib/types';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth-util';
import { invalidatePostsCache, invalidateRequestsCache } from '@/lib/api-cache';
import { sendDeclinedEmail } from '@/lib/email-service';
import { deleteR2Files } from '@/lib/r2-utils';


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { status }: { status: 'accepted' | 'denied' } = await request.json();

    // Only admin can process request decisions
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await dataService.getRequests();
    const req = requests.find(r => r.id === id);

    if (req) {
        if (status === 'accepted') {
            // Upsert post by requestId to avoid duplicate pending entries
            // when "Accept" is clicked multiple times.
            const existingPosts = await dataService.getPosts();
            const existing = existingPosts.find((post) => post.requestId === req.id);

            const postRecord: BlogPost = {
                id: existing?.id || 'post-' + Math.random().toString(36).substr(2, 9),
                requestId: req.id,
                title: req.title,
                excerpt: req.abstract || existing?.excerpt || '',
                content: req.content || existing?.content || '',
                author: req.author,
                category: req.category,
                date: existing?.date || new Date().toLocaleDateString(),
                postedAt: existing?.postedAt || new Date().toISOString(),
                images: req.images || existing?.images || [],
                attachments: req.attachments || existing?.attachments || [],
                status: existing?.status === 'published' ? 'published' : 'pending',
                authorPassword: req.authorPassword || existing?.authorPassword,
                authorEmail: req.email || existing?.authorEmail,
                satellite: req.satellite || existing?.satellite,
                areaOfInterest: req.areaOfInterest || existing?.areaOfInterest
            };

            await dataService.savePost(postRecord);
            invalidatePostsCache();
            req.status = 'accepted';
            await dataService.updateRequest(req);
            invalidateRequestsCache();
        } else if (status === 'denied') {
            // Clean up files in R2 before deleting the record
            const allFiles = [...(req.images || []), ...(req.attachments || [])];
            await deleteR2Files(allFiles);

            // Send rejection email if email exists
            if (req.email) {
                try {
                    await sendDeclinedEmail(
                        req.email,
                        req.author,
                        req.title
                    );
                } catch (error) {
                    console.error('Failed to send request denial email:', error);
                }
            }

            await dataService.deleteRequest(id);
            invalidateRequestsCache();
            return NextResponse.json({ success: true, message: 'Request rejected and deleted' });
        }

        return NextResponse.json(req);
    }

    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Only admin can delete requests
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await dataService.getRequests();
    const req = requests.find(r => r.id === id);

    // Clean up files in R2
    if (req) {
        const allFiles = [...(req.images || []), ...(req.attachments || [])];
        await deleteR2Files(allFiles);
    }

    await dataService.deleteRequest(id);
    invalidateRequestsCache();
    return NextResponse.json({ success: true, message: 'Request deleted' });
}
