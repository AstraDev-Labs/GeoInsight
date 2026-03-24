import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { dataService } from '@/lib/data-service';
import { BlogPost } from '@/lib/types';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { verifyAdminToken } from '@/lib/auth-util';
import { submitToIndexNow } from '@/lib/index-now';
import { SITE_URL } from '@/lib/constants';
import { sendPublishedEmail, sendDeclinedEmail } from '@/lib/email-service';
import { invalidatePostsCache } from '@/lib/api-cache';
import { s3, S3_BUCKET } from '@/lib/aws-config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { deleteBucketFiles } from '@/lib/r2-utils';
import { slugify } from '@/lib/utils';

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
    const isAuthorEditAttempt = Boolean(updates.email || updates.password);

    const posts = await dataService.getPosts();
    const index = posts.findIndex(p => p.id === id);

    if (index === -1) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = posts[index];

    if (!isAdmin || isAuthorEditAttempt) {
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

        // Author edit requests should not unpublish the live article.
        // Create or update a separate pending review copy linked to the original post.
        if (updates.status === 'pending') {
            const existingPendingEdit = posts.find((entry) =>
                entry.editOfId === post.id &&
                entry.status === 'pending' &&
                entry.author === post.author
            );

            const pendingEditPost: BlogPost = {
                ...post,
                ...updates,
                id: existingPendingEdit?.id || ('post-' + Math.random().toString(36).substr(2, 9)),
                editOfId: post.id,
                status: 'pending',
                authorEmail: post.authorEmail,
                authorPassword: post.authorPassword,
            };

            await dataService.savePost(pendingEditPost);
            invalidatePostsCache();
            return NextResponse.json(pendingEditPost);
        }
    }

    const updatedPost = { ...post, ...updates };

    // Admin publishing a pending edit request: merge changes into the original
    // published record and remove the temporary pending-edit copy.
    if (isAdmin && post.editOfId && updates.status === 'published') {
        const original = posts.find((entry) => entry.id === post.editOfId);
        if (!original) {
            return NextResponse.json({ error: 'Original post for edit request not found' }, { status: 404 });
        }

        const mergedPost: BlogPost = {
            ...original,
            title: updatedPost.title,
            excerpt: updatedPost.excerpt,
            content: updatedPost.content,
            category: updatedPost.category,
            images: updatedPost.images,
            attachments: updatedPost.attachments,
            satellite: updatedPost.satellite,
            areaOfInterest: updatedPost.areaOfInterest,
            reviewerNotes: updatedPost.reviewerNotes,
            status: 'published',
            postedAt: new Date().toISOString(),
        };

        await dataService.savePost(mergedPost);
        await dataService.deletePost(post.id);
        invalidatePostsCache();

        // Resolve email defensively for older records that may miss authorEmail.
        let notificationEmail = mergedPost.authorEmail;
        if (!notificationEmail) {
            const requests = await dataService.getRequests();
            const matchingRequest = requests.find((r) => r.title === mergedPost.title && r.author === mergedPost.author);
            notificationEmail = matchingRequest?.email;
        }

        if (notificationEmail) {
            try {
                const sent = await sendPublishedEmail(
                    notificationEmail,
                    mergedPost.author,
                    mergedPost.title,
                    mergedPost.id
                );
                if (!sent) {
                    console.warn('Publish notification email was not sent.', {
                        to: notificationEmail,
                        postId: mergedPost.id,
                    });
                }
            } catch (error) {
                console.error('Failed to send post status notification email:', error);
            }
        }

        const postUrl = `${SITE_URL}/blog/${slugify(mergedPost.title)}`;
        submitToIndexNow(postUrl).catch(err => console.error('Failed to notify IndexNow on update:', err));

        return NextResponse.json(mergedPost);
    }

    await dataService.savePost(updatedPost);
    invalidatePostsCache();

    // Resolve email defensively for older records that may miss authorEmail.
    let notificationEmail = updatedPost.authorEmail;
    if (isAdmin && !notificationEmail) {
        const requests = await dataService.getRequests();
        const matchingRequest = requests.find((r) => r.title === updatedPost.title && r.author === updatedPost.author);
        notificationEmail = matchingRequest?.email;
    }

    // Send status notification email from server-side for reliability.
    // This avoids client-side fire-and-forget requests getting dropped.
    if (isAdmin && notificationEmail) {
        try {
            if (updatedPost.status === 'published') {
                const sent = await sendPublishedEmail(
                    notificationEmail,
                    updatedPost.author,
                    updatedPost.title,
                    updatedPost.id
                );
                if (!sent) {
                    console.warn('Publish notification email was not sent.', {
                        to: notificationEmail,
                        postId: updatedPost.id,
                    });
                }
            } else if (updatedPost.status === 'rejected') {
                const sent = await sendDeclinedEmail(
                    notificationEmail,
                    updatedPost.author,
                    updatedPost.title,
                    updatedPost.reviewerNotes
                );
                if (!sent) {
                    console.warn('Decline notification email was not sent.', {
                        to: notificationEmail,
                        postId: updatedPost.id,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send post status notification email:', error);
        }
    }
    
    // Cleanup R2 Storage if admin declines a pending post
    if (isAdmin && updatedPost.status === 'rejected') {
        console.log(`🗑️ Post ${id} rejected. Executing R2 file cleanup...`);
        const filesToDelete = [...(updatedPost.images || []), ...(updatedPost.attachments || [])];
        await deleteBucketFiles(filesToDelete);
    }

    // Notify IndexNow if published
    if (updatedPost.status === 'published') {
        const postUrl = `${SITE_URL}/blog/${slugify(updatedPost.title)}`;
        submitToIndexNow(postUrl).catch(err => console.error('Failed to notify IndexNow on update:', err));
    }

    return NextResponse.json(updatedPost);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const posts = await dataService.getPosts();
    const post = posts.find(p => p.id === id);
    
    // Removed legacy deletePostImages in favor of deleteBucketFiles

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Extract file arrays for cleanup
    const filesToDelete = [...(post.images || []), ...(post.attachments || [])];

    // Check if admin (has valid cookie)
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    const isAdmin = verifyAdminToken(token, adminPassword);

    if (isAdmin) {
        try {
            // Admin can delete any post
            await deleteBucketFiles(filesToDelete);
            await dataService.deletePost(id);
            invalidatePostsCache();

            // Notify IndexNow about deletion
            const postUrl = `${SITE_URL}/blog/${slugify(post.title)}`;
            submitToIndexNow(postUrl).catch(err => console.error('Failed to notify IndexNow on delete:', err));

            return NextResponse.json({ success: true, message: 'Post deleted by admin' });
        } catch (error: unknown) {
            console.error("🚨 CRITICAL ERROR DURING ADMIN DELETION:", error);
            // Put the exact message inside the 'error' field so the UI prints it in the red alert box
            return NextResponse.json({ error: `INTERNAL CRASH: ${(error as Error).message || "Unknown error"}` }, { status: 500 });
        }
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

        await deleteBucketFiles(filesToDelete);
        await dataService.deletePost(id);
        invalidatePostsCache();
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

    await deleteBucketFiles(filesToDelete);
    await dataService.deletePost(id);
    invalidatePostsCache();

    // Notify IndexNow about deletion
    const postUrl = `${SITE_URL}/blog/${slugify(post.title)}`;
    submitToIndexNow(postUrl).catch(err => console.error('Failed to notify IndexNow on author delete:', err));

    return NextResponse.json({ success: true, message: 'Post deleted by author' });
}
