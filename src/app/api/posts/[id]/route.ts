import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { BlogPost } from '@/lib/types';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { verifyAdminToken } from '@/lib/auth-util';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    const updates: Partial<BlogPost> & { email?: string; password?: string } = await request.json();

    const posts = await dataService.getPosts();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[index];

    if (!isAdmin) {
        // Author self-edit: verify by email and password
        const { email, password } = updates;

        if (!email || !password) {
            return NextResponse.json({ error: 'Admin access or author email/password required for editing' }, { status: 401 });
        }

        if (email !== post.authorEmail) {
            return NextResponse.json({ error: 'Email does not match the author of this post' }, { status: 403 });
        }

        const validPassword = await bcrypt.compare(password, post.authorPassword!);
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // Remove sensitive info from updates so it doesn't get saved accidentally if malicious
        delete updates.email;
        delete updates.password;

        // Block updates to sensitive fields by authors
        // Only allow status to be changed to 'pending' to request re-approval
        if (updates.status !== 'pending') {
            delete updates.status;
        }
        delete updates.authorPassword;
        delete updates.authorEmail;
    }

    const updatedPost = { ...post, ...updates };
    await dataService.savePost(updatedPost);
    return NextResponse.json(updatedPost);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const posts = await dataService.getPosts();
    const post = posts.find(p => p.id === id);

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if admin (has valid cookie)
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (isAdmin) {
        // Admin can delete any post
        await dataService.deletePost(id);
        return NextResponse.json({ success: true, message: 'Post deleted by admin' });
    }

    // Author self-delete: verify by email and password
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Email and password required for author deletion' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are both required' }, { status: 400 });
    }

    if (!post.authorEmail || !post.authorPassword) {
        // If it's a legacy post without email/password stored, block deletion or find via request history
        const requests = await dataService.getRequests();
        const originalReq = requests.find(r =>
            r.title === post.title && r.author === post.author && r.email === email
        );

        if (!originalReq || !originalReq.authorPassword) {
            return NextResponse.json({ error: 'No secure password exists on record for this older post. Only Admin can delete.' }, { status: 403 });
        }

        // Validate via originalReq
        const validPassword = await bcrypt.compare(password, originalReq.authorPassword);
        if (!validPassword) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        await dataService.deletePost(id);
        return NextResponse.json({ success: true, message: 'Post deleted by author (legacy req check)' });
    }

    // Modern posts check directly
    if (email !== post.authorEmail && email !== post.author) {
        // Also allow email matching `post.author` as a fallback just in case they typed correctly. 
        // But really we just want to match email. Let's just do:
    }

    if (email !== post.authorEmail) {
        return NextResponse.json({ error: 'Email does not match the author of this post' }, { status: 403 });
    }

    const validPassword = await bcrypt.compare(password, post.authorPassword);

    if (!validPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    await dataService.deletePost(id);
    return NextResponse.json({ success: true, message: 'Post deleted by author' });
}
