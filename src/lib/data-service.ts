/* eslint-disable @typescript-eslint/no-explicit-any */

import { BlogPost, BotSettings, CommentSanction, CommentUser, PostComment, PostRequest, SiteSettings } from "./types";
import { readDb, writeDb } from "./db-server";
import { getDb } from "./d1-client";
import { randomUUID } from "crypto";
import { toCommenterKey } from "./comment-identity";
import { DEFAULT_BOT_SETTINGS } from "./comment-moderation";

// --- Helpers and Constants ---

const BOT_SETTINGS_ID = 'bot-settings';
const SITE_SETTINGS_ID = 'site-settings';
const MUTED_HOURS_ON_VIOLATION = 12;

const normalizeComment = (comment: any): PostComment => ({
    ...comment,
    status: comment.status || 'visible',
});

const normalizeCommentSanction = (s: any): CommentSanction => ({
    ...s,
    strikes: Number(s.strikes || 0),
    banned: Boolean(s.banned),
    commenterKey: s.commenterKey || s.subjectId,
});

const normalizeCommentUser = (u: any): CommentUser => ({
    ...u,
    emailVerified: Boolean(u.emailVerified),
});

const normalizeBotSettings = (s: any): BotSettings => ({
    ...DEFAULT_BOT_SETTINGS,
    ...s,
});

async function withPerfProfile<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
        return await fn();
    } finally {
        const end = Date.now();
        if (end - start > 100) {
            console.warn(`[PERF] ${name} took ${end - start}ms`);
        }
    }
}

export const dataService = {
    // Requests
    getRequests: async (): Promise<PostRequest[]> => withPerfProfile('getRequests', async () => {
        try {
            const db = getDb();
            const { results } = await db.prepare("SELECT * FROM requests ORDER BY submittedAt DESC").all<any>();
            return results.map(row => ({
                ...row,
                images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
                attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || [])
            }));
        } catch (error) {
            console.error("D1 getRequests failed, falling back to local DB:", error);
            return readDb().requests;
        }
    }),

    addRequest: async (request: PostRequest): Promise<void> => {
        try {
            const db = getDb();
            await db.prepare(`
                INSERT INTO requests (
                    id, title, author, email, abstract, content, category,
                    submittedAt, status, images, attachments, authorPassword,
                    satellite, areaOfInterest
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                request.id, request.title, request.author, request.email, request.abstract || null,
                request.content, request.category, request.submittedAt, request.status,
                JSON.stringify(request.images || []), JSON.stringify(request.attachments || []),
                request.authorPassword || null, request.satellite || null, request.areaOfInterest || null
            ).run();
        } catch (error) {
            console.error("D1 addRequest failed, falling back to local DB:", error);
            const db = readDb();
            db.requests.push(request);
            writeDb(db);
        }
    },

    updateRequest: async (updatedRequest: PostRequest): Promise<void> => {
        try {
            const db = getDb();
            await db.prepare(`
                UPDATE requests SET
                    title = ?, author = ?, email = ?, abstract = ?, content = ?,
                    category = ?, submittedAt = ?, status = ?, images = ?,
                    attachments = ?, authorPassword = ?, satellite = ?,
                    areaOfInterest = ?
                WHERE id = ?
            `).bind(
                updatedRequest.title, updatedRequest.author, updatedRequest.email, updatedRequest.abstract || null,
                updatedRequest.content, updatedRequest.category, updatedRequest.submittedAt,
                updatedRequest.status, JSON.stringify(updatedRequest.images || []),
                JSON.stringify(updatedRequest.attachments || []), updatedRequest.authorPassword || null,
                updatedRequest.satellite || null, updatedRequest.areaOfInterest || null, updatedRequest.id
            ).run();
        } catch (error) {
            console.error("D1 updateRequest failed, falling back to local DB:", error);
            const db = readDb();
            const index = db.requests.findIndex(r => r.id === updatedRequest.id);
            if (index !== -1) {
                db.requests[index] = updatedRequest;
                writeDb(db);
            }
        }
    },

    deleteRequest: async (id: string): Promise<void> => {
        try {
            const db = getDb();
            await db.prepare("DELETE FROM requests WHERE id = ?").bind(id).run();
        } catch (error) {
            console.error("D1 deleteRequest failed, falling back to local DB:", error);
            const db = readDb();
            db.requests = db.requests.filter(r => r.id !== id);
            writeDb(db);
        }
    },

    // Posts
    getPosts: async (): Promise<BlogPost[]> => withPerfProfile('getPosts', async () => {
        try {
            const db = getDb();
            const { results } = await db.prepare("SELECT * FROM posts ORDER BY date DESC, postedAt DESC").all<any>();
            return results.map(row => ({
                ...row,
                images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
                attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || [])
            }));
        } catch (error) {
            console.error("D1 getPosts failed, falling back to local DB:", error);
            return readDb().posts;
        }
    }),

    savePost: async (post: BlogPost): Promise<void> => {
        try {
            const db = getDb();
            await db.prepare(`
                INSERT INTO posts (
                    id, requestId, editOfId, title, excerpt, content, author,
                    category, date, postedAt, images, status, reviewerNotes,
                    attachments, authorPassword, authorEmail, satellite, areaOfInterest
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    requestId = excluded.requestId, editOfId = excluded.editOfId,
                    title = excluded.title, excerpt = excluded.excerpt,
                    content = excluded.content, author = excluded.author,
                    category = excluded.category, date = excluded.date,
                    postedAt = excluded.postedAt, images = excluded.images,
                    status = excluded.status, reviewerNotes = excluded.reviewerNotes,
                    attachments = excluded.attachments, authorPassword = excluded.authorPassword,
                    authorEmail = excluded.authorEmail, satellite = excluded.satellite,
                    areaOfInterest = excluded.areaOfInterest
            `).bind(
                post.id, post.requestId || null, post.editOfId || null, post.title, post.excerpt || null,
                post.content, post.author, post.category, post.date, post.postedAt || null,
                JSON.stringify(post.images || []), post.status, post.reviewerNotes || null,
                JSON.stringify(post.attachments || []), post.authorPassword || null,
                post.authorEmail || null, post.satellite || null, post.areaOfInterest || null
            ).run();
        } catch (error) {
            console.error("D1 savePost failed, falling back to local DB:", error);
            const db = readDb();
            const index = db.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                db.posts[index] = post;
            } else {
                db.posts.push(post);
            }
            writeDb(db);
        }
    },

    deletePost: async (id: string): Promise<void> => {
        try {
            const db = getDb();
            await db.batch([
                db.prepare("DELETE FROM posts WHERE id = ?").bind(id),
                db.prepare("DELETE FROM comments WHERE postId = ?").bind(id)
            ]);
        } catch (error) {
            console.error("D1 deletePost failed, falling back to local DB:", error);
            const db = readDb();
            db.posts = db.posts.filter(p => p.id !== id);
            db.comments = (db.comments || []).filter(c => c.postId !== id);
            writeDb(db);
        }
    },

    clearHistory: async (): Promise<void> => {
        try {
            const db = getDb();
            await db.batch([
                db.prepare("DELETE FROM requests WHERE status != 'pending'"),
                db.prepare("DELETE FROM posts WHERE status = 'rejected'")
            ]);
            const dbLocal = readDb();
            dbLocal.requests = (dbLocal.requests || []).filter(r => r.status === 'pending');
            dbLocal.posts = (dbLocal.posts || []).filter(p => p.status !== 'rejected');
            writeDb(dbLocal);
        } catch (error) {
            console.error("clearHistory failed:", error);
            throw error;
        }
    },

    // Comments
    getCommentsForPost: async (postId: string): Promise<PostComment[]> => withPerfProfile('getCommentsForPost', async () => {
        try {
            const db = getDb();
            const { results } = await db.prepare("SELECT * FROM comments WHERE postId = ? ORDER BY createdAt ASC").bind(postId).all<any>();
            return results.map(normalizeComment);
        } catch (error) {
            console.error("D1 getCommentsForPost failed:", error);
            return (readDb().comments || []).filter(c => c.postId === postId).map(normalizeComment);
        }
    }),

    addComment: async (payload: Omit<PostComment, "id" | "createdAt">): Promise<PostComment> => {
        const comment: PostComment = {
            id: `comment-${randomUUID()}`,
            createdAt: new Date().toISOString(),
            status: 'visible',
            ...payload
        };
        try {
            const db = getDb();
            await db.prepare(`
                INSERT INTO comments (id, postId, parentId, authorName, commenterId, commenterKey, message, createdAt, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                comment.id, comment.postId, comment.parentId || null, comment.authorName,
                comment.commenterId || null, comment.commenterKey || null, comment.message,
                comment.createdAt, comment.status
            ).run();
        } catch (error) {
            console.error("D1 addComment failed:", error);
            const db = readDb();
            db.comments.push(comment);
            writeDb(db);
        }
        return comment;
    },

    moderateComment: async (commentId: string, moderation: { status: 'visible' | 'hidden'; moderatedBy: string }): Promise<PostComment | null> => {
        try {
            const db = getDb();
            const existing = await db.prepare("SELECT * FROM comments WHERE id = ?").bind(commentId).first<any>();
            if (!existing) return null;

            const updated = {
                ...normalizeComment(existing),
                status: moderation.status,
                moderatedBy: moderation.moderatedBy,
                moderatedAt: new Date().toISOString()
            };

            await db.prepare("UPDATE comments SET status = ?, moderatedBy = ?, moderatedAt = ? WHERE id = ?")
                .bind(updated.status, updated.moderatedBy, updated.moderatedAt, commentId).run();
            return updated;
        } catch (error) {
            console.error("D1 moderateComment failed:", error);
            return null;
        }
    },

    deleteComment: async (commentId: string): Promise<boolean> => {
        try {
            const db = getDb();
            await db.batch([
                db.prepare("DELETE FROM comments WHERE id = ?").bind(commentId),
                db.prepare("DELETE FROM comments WHERE parentId = ?").bind(commentId)
            ]);
            const dbLocal = readDb();
            dbLocal.comments = dbLocal.comments.filter(c => c.id !== commentId && c.parentId !== commentId);
            writeDb(dbLocal);
            return true;
        } catch (error) {
            console.error("D1 deleteComment failed:", error);
            return false;
        }
    },

    // Sanctions
    getCommentSanction: async (subjectId: string): Promise<CommentSanction | null> => {
        try {
            const db = getDb();
            const result = await db.prepare("SELECT * FROM comment_sanctions WHERE subjectId = ?").bind(subjectId).first<any>();
            return result ? normalizeCommentSanction(result) : null;
        } catch (error) {
            console.error("D1 getCommentSanction failed:", error);
            return null;
        }
    },

    upsertCommentSanction: async (sanction: CommentSanction): Promise<CommentSanction> => {
        const normalized = normalizeCommentSanction(sanction);
        try {
            const db = getDb();
            await db.prepare(`
                INSERT INTO comment_sanctions (subjectId, commenterKey, commenterName, strikes, mutedUntil, banned, lastViolationAt, lastReason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(subjectId) DO UPDATE SET
                    strikes = excluded.strikes, mutedUntil = excluded.mutedUntil,
                    banned = excluded.banned, lastViolationAt = excluded.lastViolationAt,
                    lastReason = excluded.lastReason
            `).bind(
                normalized.subjectId, normalized.commenterKey || null, normalized.commenterName,
                normalized.strikes, normalized.mutedUntil || null, normalized.banned ? 1 : 0,
                normalized.lastViolationAt || null, normalized.lastReason || null
            ).run();
        } catch (error) {
            console.error("D1 upsertCommentSanction failed:", error);
        }
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

    // Users
    getCommentUserByName: async (name: string): Promise<CommentUser | null> => {
        const commenterKey = toCommenterKey(name);
        try {
            const db = getDb();
            const result = await db.prepare("SELECT * FROM comment_users WHERE commenterKey = ?").bind(commenterKey).first<any>();
            return result ? normalizeCommentUser(result) : null;
        } catch (error) {
            console.error("D1 getCommentUserByName failed:", error);
            return null;
        }
    },

    getCommentUserByEmail: async (email: string): Promise<CommentUser | null> => {
        try {
            const db = getDb();
            const result = await db.prepare("SELECT * FROM comment_users WHERE email = ?").bind(email.toLowerCase()).first<any>();
            return result ? normalizeCommentUser(result) : null;
        } catch (error) {
            console.error("D1 getCommentUserByEmail failed:", error);
            return null;
        }
    },

    updateCommentUser: async (user: CommentUser): Promise<CommentUser> => {
        const normalized = normalizeCommentUser(user);
        try {
            const db = getDb();
            await db.prepare(`
                UPDATE comment_users SET
                    name = ?, email = ?, emailVerified = ?, role = ?,
                    passwordHash = ?, emailVerificationCodeHash = ?,
                    emailVerificationExpiresAt = ?, createdAt = ?
                WHERE userId = ?
            `).bind(
                normalized.name, normalized.email, normalized.emailVerified ? 1 : 0,
                normalized.role, normalized.passwordHash, normalized.emailVerificationCodeHash || null,
                normalized.emailVerificationExpiresAt || null, normalized.createdAt, normalized.userId
            ).run();
        } catch (error) {
            console.error("D1 updateCommentUser failed:", error);
        }
        return normalized;
    },

    createCommentUser: async (payload: any): Promise<CommentUser> => {
        const commenterKey = toCommenterKey(payload.name);
        const user: CommentUser = {
            userId: randomUUID(),
            commenterKey,
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
            emailVerified: Boolean(payload.emailVerified),
            role: payload.role || 'user',
            passwordHash: payload.passwordHash,
            createdAt: new Date().toISOString(),
        };
        try {
            const db = getDb();
            await db.prepare(`
                INSERT INTO comment_users (userId, commenterKey, name, email, emailVerified, role, passwordHash, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(user.userId, user.commenterKey, user.name, user.email, user.emailVerified ? 1 : 0, user.role, user.passwordHash, user.createdAt).run();
        } catch (error) {
            console.error("D1 createCommentUser failed:", error);
        }
        return user;
    },

    // Settings
    getBotSettings: async (): Promise<BotSettings> => {
        try {
            const db = getDb();
            const result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(BOT_SETTINGS_ID).first<any>();
            if (result) return normalizeBotSettings(JSON.parse(result.value));
        } catch (error) {
            console.error("D1 getBotSettings failed:", error);
        }
        return normalizeBotSettings(readDb().botSettings);
    },

    saveBotSettings: async (settings: Partial<BotSettings>): Promise<BotSettings> => {
        const current = await dataService.getBotSettings();
        const merged = normalizeBotSettings({ ...current, ...settings });
        try {
            const db = getDb();
            await db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
                .bind(BOT_SETTINGS_ID, JSON.stringify(merged)).run();
        } catch (error) {
            console.error("D1 saveBotSettings failed:", error);
        }
        return merged;
    },

    getSiteSettings: async (): Promise<SiteSettings> => {
        const defaultSettings: SiteSettings = { lockdownMode: 'none' };
        try {
            const db = getDb();
            const result = await db.prepare("SELECT value FROM settings WHERE key = ?").bind(SITE_SETTINGS_ID).first<any>();
            if (result) return { ...defaultSettings, ...JSON.parse(result.value) };
        } catch (error) {
            console.error("D1 getSiteSettings failed:", error);
        }
        return { ...defaultSettings, ...readDb().siteSettings };
    },

    saveSiteSettings: async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
        const current = await dataService.getSiteSettings();
        const merged = { ...current, ...settings };
        try {
            const db = getDb();
            await db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
                .bind(SITE_SETTINGS_ID, JSON.stringify(merged)).run();
        } catch (error) {
            console.error("D1 saveSiteSettings failed:", error);
        }
        return merged;
    },
};
