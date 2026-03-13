import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { BlogPost } from '@/lib/types';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth-util';
import { invalidatePostsCache, invalidateRequestsCache } from '@/lib/api-cache';
import { sendDeclinedEmail } from '@/lib/email-service';
import { deleteBucketFiles } from '@/lib/r2-utils';

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
        } else if (status === 'denied' && req.email) {
            req.status = 'denied';
            await dataService.updateRequest(req);
            invalidateRequestsCache();
            // Free up R2 Storage for denied items
            const filesToDelete = [...(req.images || []), ...(req.attachments || [])];
            await deleteBucketFiles(filesToDelete);
            
            try {
                const sent = await sendDeclinedEmail(
                    req.email,
                    req.author,
                    req.title
                );
                if (!sent) {
                    console.warn('Request denial email was not sent.', {
                        to: req.email,
                        requestId: req.id,
                    });
                }
            } catch (error) {
                console.error('Failed to send request denial email:', error);
            }
        } else {
            req.status = 'denied';
            await dataService.updateRequest(req);
            invalidateRequestsCache();
            
            // Free up R2 Storage for denied items
            const filesToDelete = [...(req.images || []), ...(req.attachments || [])];
            await deleteBucketFiles(filesToDelete);
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
    
    // Critical: Do NOT delete files if the request was accepted, 
    // because those files are now being used by the active Blog Post!
    if (req && req.status !== 'accepted') {
        const filesToDelete = [...(req.images || []), ...(req.attachments || [])];
        await deleteBucketFiles(filesToDelete);
    }

    await dataService.deleteRequest(id);
    invalidateRequestsCache();
    return NextResponse.json({ success: true, message: 'Request deleted' });
}
