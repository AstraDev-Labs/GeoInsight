import { PutCommand, ScanCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME, useAWS as awsEnabled, s3, S3_BUCKET } from "./aws-config";
import { BlogPost, BotSettings, CommentSanction, CommentUser, PostComment, PostRequest } from "./types";
import { readDb, writeDb } from "./db-server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';
import { randomUUID } from "crypto";
import { toCommenterKey } from "./comment-identity";
import { DEFAULT_BOT_SETTINGS } from "./comment-moderation";

const normalizeComment = (comment: PostComment): PostComment => ({
    ...comment,
    status: comment.status === 'hidden' ? 'hidden' : 'visible',
});

const normalizeCommentUser = (user: CommentUser): CommentUser => ({
    ...user,
    userId: user.userId || user.commenterKey,
    role: user.role || 'user',
    email: (user.email || '').trim().toLowerCase(),
    emailVerified: Boolean(user.emailVerified),
});

const normalizeCommentSanction = (sanction: CommentSanction): CommentSanction => ({
    ...sanction,
    subjectId: sanction.subjectId || sanction.commenterKey,
});

const toSanctionId = (subjectId: string) => `sanction-${subjectId}`;
const toCommentUserId = (commenterKey: string) => `comment-user-${commenterKey}`;
const BOT_SETTINGS_ID = 'bot-settings-global';
const MUTED_HOURS_ON_VIOLATION = 24;

const normalizeBotSettings = (settings?: Partial<BotSettings> | null): BotSettings => ({
    autoModerationEnabled: settings?.autoModerationEnabled ?? DEFAULT_BOT_SETTINGS.autoModerationEnabled,
    violationTerms: Array.isArray(settings?.violationTerms) && settings.violationTerms.length > 0
        ? settings.violationTerms
        : DEFAULT_BOT_SETTINGS.violationTerms,
    severeTerms: Array.isArray(settings?.severeTerms) && settings.severeTerms.length > 0
        ? settings.severeTerms
        : DEFAULT_BOT_SETTINGS.severeTerms,
    violationMuteHours: typeof settings?.violationMuteHours === 'number' && settings.violationMuteHours > 0
        ? settings.violationMuteHours
        : DEFAULT_BOT_SETTINGS.violationMuteHours,
    autoBanOnSevere: settings?.autoBanOnSevere ?? DEFAULT_BOT_SETTINGS.autoBanOnSevere,
});

const withPerfProfile = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const start = Date.now();
    try {
        return await fn();
    } finally {
        const ms = Date.now() - start;
        if (ms > 300) {
            console.warn(`[perf] slow path ${label}: ${ms}ms`);
        }
    }
};

export const dataService = {
    // Requests
    getRequests: async (): Promise<PostRequest[]> => withPerfProfile('dataService.getRequests', async () => {
        return readDb().requests;
    }),

    addRequest: async (request: PostRequest): Promise<void> => {
        const db = readDb();
        db.requests.push(request);
        writeDb(db);
    },

    updateRequest: async (updatedRequest: PostRequest): Promise<void> => {
        const db = readDb();
        const index = db.requests.findIndex(r => r.id === updatedRequest.id);
        if (index !== -1) {
            db.requests[index] = updatedRequest;
            writeDb(db);
        }
    },

    // Posts
    getPosts: async (): Promise<BlogPost[]> => withPerfProfile('dataService.getPosts', async () => {
        return readDb().posts;
    }),

    savePost: async (post: BlogPost): Promise<void> => {
        const db = readDb();
        const index = db.posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
            db.posts[index] = post;
        } else {
            db.posts.push(post);
        }
        writeDb(db);
    },

    deletePost: async (id: string): Promise<void> => {
        // 1. Fetch the post first to identify associated files
        const posts = await dataService.getPosts();
        const post = posts.find(p => p.id === id);

        if (!post) return;

        // 2. Clear files from S3 or Local storage
        const filesToDelete = [...(post.images || []), ...(post.attachments || [])];

        for (const fileUrl of filesToDelete) {
            try {
                if (awsEnabled && ddbDocClient && s3 && fileUrl.startsWith('https://')) {
                    // Extract S3 Key from URL
                    // Format: https://bucket.s3.region.amazonaws.com/key
                    const s3UrlParts = fileUrl.split('.amazonaws.com/');
                    if (s3UrlParts.length > 1) {
                        const key = s3UrlParts[1];
                        console.log(`🗑️ Deleting S3 object: ${key}`);
                        await s3.send(new DeleteObjectCommand({
                            Bucket: S3_BUCKET,
                            Key: key
                        }));
                    }
                } else if (fileUrl.startsWith('/uploads/')) {
                    // Delete local file
                    const filename = fileUrl.replace('/uploads/', '');
                    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                    if (fs.existsSync(filePath)) {
                        console.log(`🗑️ Deleting local file: ${filename}`);
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (err) {
                console.error(`Failed to delete file ${fileUrl}:`, err);
            }
        }

        // 3. Delete from Database
        const db = readDb();
        db.posts = db.posts.filter(p => p.id !== id);
        writeDb(db);
    },

    deleteRequest: async (id: string): Promise<void> => {
        const db = readDb();
        db.requests = db.requests.filter(r => r.id !== id);
        writeDb(db);
    },

    clearHistory: async (): Promise<void> => {
        try {
            // 1. Get current data for identification
            const allRequests = await dataService.getRequests() || [];
            const allPosts = await dataService.getPosts() || [];

            // 2. Clear Local JSON DB (Safe sync operation)
            const db = readDb() || { posts: [], requests: [] };
            const safeRequests = Array.isArray(db.requests) ? db.requests : [];
            const safePosts = Array.isArray(db.posts) ? db.posts : [];

            db.requests = safeRequests.filter((request: PostRequest) => request.status === 'pending');
            db.posts = safePosts.filter((post: BlogPost) => post.status !== 'rejected');
            writeDb(db);

            // 3. (AWS Cleared disabled - Local only)
        } catch (error: unknown) {
            console.error("CRITICAL: clearHistory failed:", error);
            const message = error instanceof Error ? error.message : "Failed to execute database purge";
            throw new Error(message);
        }
    },

    // Collaboration comments
    getCommentsForPost: async (postId: string): Promise<PostComment[]> => withPerfProfile(`dataService.getCommentsForPost:${postId}`, async () => {
        return readDb()
            .comments
            .filter((comment) => comment.postId === postId)
            .map(normalizeComment)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return readDb()
            .comments
            .filter((comment) => comment.postId === postId)
            .map(normalizeComment)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }),

    addComment: async (payload: Omit<PostComment, "id" | "createdAt">): Promise<PostComment> => {
        const newComment: PostComment = {
            id: `comment-${randomUUID()}`,
            createdAt: new Date().toISOString(),
            status: 'visible',
            ...payload,
        };

        const db = readDb();
        db.comments.push(newComment);
        writeDb(db);
        return newComment;
    },

    moderateComment: async (
        commentId: string,
        moderation: { status: 'visible' | 'hidden'; moderatedBy: string }
    ): Promise<PostComment | null> => {
        const db = readDb();
        const index = db.comments.findIndex((comment) => comment.id === commentId);
        if (index === -1) return null;

        const updated = {
            ...normalizeComment(db.comments[index]),
            status: moderation.status,
            moderatedBy: moderation.moderatedBy,
            moderatedAt: new Date().toISOString(),
        };
        db.comments[index] = updated;
        writeDb(db);
        return updated;
    },

    deleteComment: async (commentId: string): Promise<boolean> => {
        const db = readDb();
        const before = db.comments.length;
        db.comments = db.comments.filter((comment) => comment.id !== commentId);
        const deleted = db.comments.length !== before;

        if (deleted) {
            db.comments = db.comments.filter((comment) => comment.parentId !== commentId);
            writeDb(db);
        }

        return deleted;
    },

    getCommentSanction: async (subjectId: string): Promise<CommentSanction | null> => {
        if (!subjectId) return null;

        const db = readDb();
        const sanction = db.commentSanctions.find((item) => (item.subjectId || item.commenterKey) === subjectId);
        return sanction ? normalizeCommentSanction(sanction) : null;
    },

    upsertCommentSanction: async (sanction: CommentSanction): Promise<CommentSanction> => {
        const normalized = normalizeCommentSanction(sanction);

        const db = readDb();
        const index = db.commentSanctions.findIndex((item) => (item.subjectId || item.commenterKey) === normalized.subjectId);
        if (index === -1) {
            db.commentSanctions.push(normalized);
        } else {
            db.commentSanctions[index] = normalized;
        }
        writeDb(db);
        return normalized;
    },

    applyViolationToCommenter: async (payload: {
        subjectId: string;
        commenterName: string;
        reason: string;
        severe: boolean;
        muteHours?: number;
        autoBanOnSevere?: boolean;
    }): Promise<CommentSanction> => {
        const current = await dataService.getCommentSanction(payload.subjectId);
        const now = new Date();
        const nextStrikes = (current?.strikes || 0) + (payload.severe ? 2 : 1);
        const shouldBan = payload.severe && payload.autoBanOnSevere !== false;

        const next: CommentSanction = {
            subjectId: payload.subjectId,
            commenterKey: payload.subjectId,
            commenterName: payload.commenterName,
            strikes: nextStrikes,
            banned: shouldBan ? true : Boolean(current?.banned),
            mutedUntil: payload.severe
                ? undefined
                : new Date(now.getTime() + (payload.muteHours || MUTED_HOURS_ON_VIOLATION) * 60 * 60 * 1000).toISOString(),
            lastViolationAt: now.toISOString(),
            lastReason: payload.reason,
        };

        return dataService.upsertCommentSanction(next);
    },

    getCommentUserByName: async (name: string): Promise<CommentUser | null> => {
        const commenterKey = toCommenterKey(name);
        if (!commenterKey) return null;

        const db = readDb();
        const user = db.commentUsers.find((record) => record.commenterKey === commenterKey);
        return user ? normalizeCommentUser(user) : null;
    },

    getCommentUserByEmail: async (email: string): Promise<CommentUser | null> => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) return null;

        const db = readDb();
        const user = db.commentUsers.find((record) => record.email?.toLowerCase() === normalizedEmail);
        return user ? normalizeCommentUser(user) : null;
    },

    updateCommentUser: async (user: CommentUser): Promise<CommentUser> => {
        const normalized = normalizeCommentUser(user);

        const db = readDb();
        const index = db.commentUsers.findIndex((existing) => existing.commenterKey === normalized.commenterKey);
        if (index === -1) {
            db.commentUsers.push(normalized);
        } else {
            db.commentUsers[index] = normalized;
        }
        writeDb(db);
        return normalized;
    },

    createCommentUser: async (payload: {
        name: string;
        email: string;
        passwordHash: string;
        role?: 'user' | 'bot' | 'admin';
        emailVerified?: boolean;
        emailVerificationCodeHash?: string;
        emailVerificationExpiresAt?: string;
    }): Promise<CommentUser> => {
        const commenterKey = toCommenterKey(payload.name);
        const user: CommentUser = {
            userId: randomUUID(),
            commenterKey,
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
            emailVerified: Boolean(payload.emailVerified),
            role: payload.role || 'user',
            passwordHash: payload.passwordHash,
            emailVerificationCodeHash: payload.emailVerificationCodeHash,
            emailVerificationExpiresAt: payload.emailVerificationExpiresAt,
            createdAt: new Date().toISOString(),
        };

        const db = readDb();
        db.commentUsers = db.commentUsers.filter((existing) => existing.commenterKey !== commenterKey);
        db.commentUsers.push(user);
        writeDb(db);
        return user;
    },

    getBotSettings: async (): Promise<BotSettings> => {
        const db = readDb();
        return normalizeBotSettings(db.botSettings);
    },

    saveBotSettings: async (settings: Partial<BotSettings>): Promise<BotSettings> => {
        const current = await dataService.getBotSettings();
        const merged = normalizeBotSettings({ ...current, ...settings });

        // Always mirror to local DB so fallback mode stays consistent.
        const db = readDb();
        db.botSettings = merged;
        writeDb(db);

        return merged;
    },
};
