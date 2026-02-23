import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verifyAdminToken, verifyCommentToken } from '@/lib/auth-util';
import { toCommenterKey } from '@/lib/comment-identity';
import { moderateCommentText } from '@/lib/comment-moderation';
import { dataService } from '@/lib/data-service';

type Params = { params: Promise<{ id: string }> };
const AUTOMOD_NAME = 'AutoMod Bot';

const getCommentSession = async () => {
    const cookieStore = await cookies();
    const commentToken = cookieStore.get('comment_auth_token')?.value;
    const commentSession = verifyCommentToken(commentToken);
    if (commentSession) return commentSession;

    const adminToken = cookieStore.get('admin_token')?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim();
    if (verifyAdminToken(adminToken, adminPassword)) {
        return { name: 'Admin', role: 'admin' as const, timestamp: Date.now() };
    }

    return null;
};

export async function GET(_: Request, { params }: Params) {
    const { id } = await params;
    const session = await getCommentSession();
    const comments = await dataService.getCommentsForPost(id);
    const isModerator = session?.role === 'admin' || session?.role === 'bot';

    if (isModerator) {
        return NextResponse.json(comments);
    }

    return NextResponse.json(comments.filter((comment) => comment.status !== 'hidden'));
}

export async function POST(request: Request, { params }: Params) {
    const { id } = await params;
    const session = await getCommentSession();

    if (!session || session.role !== 'user') {
        return NextResponse.json({ error: 'Sign in as a user to comment' }, { status: 401 });
    }

    const body = await request.json() as {
        message?: string;
        parentId?: string;
    };

    const message = (body.message || '').trim();
    const parentId = (body.parentId || '').trim();
    const authorName = session.name.trim();
    const commenterKey = session.commenterKey || toCommenterKey(authorName);
    const sanctionSubjectId = session.userId || commenterKey;

    const sanction = await dataService.getCommentSanction(sanctionSubjectId);
    if (sanction?.banned) {
        return NextResponse.json({ error: 'You are banned from comments due to repeated/severe violations.' }, { status: 403 });
    }

    if (sanction?.mutedUntil && new Date(sanction.mutedUntil).getTime() > Date.now()) {
        return NextResponse.json(
            { error: `You are muted from comments until ${new Date(sanction.mutedUntil).toLocaleString('en-US')}.` },
            { status: 429 }
        );
    }

    if (!message) {
        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (authorName.length > 80 || message.length > 2000) {
        return NextResponse.json({ error: 'Comment exceeds allowed length' }, { status: 400 });
    }

    if (parentId) {
        const existing = await dataService.getCommentsForPost(id);
        const parent = existing.find((comment) => comment.id === parentId);
        if (!parent) {
            return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
        }
    }

    const botSettings = await dataService.getBotSettings();
    const moderation = moderateCommentText(message, botSettings);
    if (moderation.level !== 'clean') {
        const applied = await dataService.applyViolationToCommenter({
            subjectId: sanctionSubjectId,
            commenterName: authorName,
            reason: moderation.reason || 'Policy violation',
            severe: moderation.level === 'severe',
            muteHours: botSettings.violationMuteHours,
            autoBanOnSevere: botSettings.autoBanOnSevere,
        });

        await dataService.addComment({
            postId: id,
            parentId: parentId || undefined,
            authorName,
            commenterId: session.userId,
            commenterKey,
            message,
            status: 'hidden',
            moderatedBy: AUTOMOD_NAME,
            moderatedAt: new Date().toISOString(),
            moderationReason: moderation.reason,
        });

        if (applied.banned) {
            return NextResponse.json(
                { error: 'Severe rule violation detected. You are banned from comments.' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: `Rule violation detected. Your comment was hidden and you are temporarily muted for ${botSettings.violationMuteHours} hours.` },
            { status: 429 }
        );
    }

    const comment = await dataService.addComment({
        postId: id,
        parentId: parentId || undefined,
        authorName,
        commenterId: session.userId,
        commenterKey,
        message,
    });

    return NextResponse.json(comment, { status: 201 });
}

export async function PATCH(request: Request, { params }: Params) {
    const { id: postId } = await params;
    const session = await getCommentSession();
    const isModerator = session?.role === 'admin' || session?.role === 'bot';
    if (!isModerator || !session) {
        return NextResponse.json({ error: 'Only bot/admin can moderate comments' }, { status: 403 });
    }

    const body = await request.json() as {
        commentId?: string;
        status?: 'visible' | 'hidden';
    };

    const commentId = (body.commentId || '').trim();
    const status = body.status;

    if (!commentId || !status || !['visible', 'hidden'].includes(status)) {
        return NextResponse.json({ error: 'commentId and valid status are required' }, { status: 400 });
    }

    const comments = await dataService.getCommentsForPost(postId);
    if (!comments.find((comment) => comment.id === commentId)) {
        return NextResponse.json({ error: 'Comment not found for this post' }, { status: 404 });
    }

    const updated = await dataService.moderateComment(commentId, {
        status,
        moderatedBy: session.name,
    });

    if (!updated) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: Params) {
    const { id: postId } = await params;
    const session = await getCommentSession();
    const isModerator = session?.role === 'admin' || session?.role === 'bot';
    if (!isModerator) {
        return NextResponse.json({ error: 'Only bot/admin can delete comments' }, { status: 403 });
    }

    const body = await request.json() as { commentId?: string };
    const commentId = (body.commentId || '').trim();
    if (!commentId) {
        return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    const comments = await dataService.getCommentsForPost(postId);
    if (!comments.find((comment) => comment.id === commentId)) {
        return NextResponse.json({ error: 'Comment not found for this post' }, { status: 404 });
    }

    const deleted = await dataService.deleteComment(commentId);
    if (!deleted) {
        return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
