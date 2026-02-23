import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { BlogPost, PostRequest } from '@/lib/types';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth-util';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { status }: { status: 'accepted' | 'denied' } = await request.json();

    const requests = await dataService.getRequests();
    const req = requests.find(r => r.id === id);

    if (req) {
        req.status = status;
        await dataService.updateRequest(req);

        if (status === 'accepted') {
            const newPost: BlogPost = {
                id: 'post-' + Math.random().toString(36).substr(2, 9),
                title: req.title,
                excerpt: req.abstract || '',
                content: req.content || '',
                author: req.author,
                category: req.category,
                date: new Date().toLocaleDateString(),
                postedAt: new Date().toISOString(),
                images: req.images || [],
                attachments: req.attachments || [],
                status: 'pending',
                authorPassword: req.authorPassword,
                authorEmail: req.email,
                satellite: req.satellite,
                areaOfInterest: req.areaOfInterest
            };
            await dataService.savePost(newPost);
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

    await dataService.deleteRequest(id);
    return NextResponse.json({ success: true, message: 'Request deleted' });
}
