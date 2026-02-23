import fs from 'fs';
import path from 'path';
import { BlogPost, BotSettings, CommentSanction, CommentUser, PostComment, PostRequest } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface DbSchema {
    posts: BlogPost[];
    requests: PostRequest[];
    comments: PostComment[];
    commentUsers: CommentUser[];
    commentSanctions: CommentSanction[];
    botSettings?: BotSettings;
}

export const readDb = (): DbSchema => {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(data) as Partial<DbSchema>;
        return {
            posts: Array.isArray(parsed.posts) ? parsed.posts : [],
            requests: Array.isArray(parsed.requests) ? parsed.requests : [],
            comments: Array.isArray(parsed.comments) ? parsed.comments : [],
            commentUsers: Array.isArray(parsed.commentUsers) ? parsed.commentUsers : [],
            commentSanctions: Array.isArray(parsed.commentSanctions) ? parsed.commentSanctions : [],
            botSettings: parsed.botSettings,
        };
    } catch (error) {
        return { posts: [], requests: [], comments: [], commentUsers: [], commentSanctions: [] };
    }
};

export const writeDb = (data: DbSchema) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error: unknown) {
        if ((error as { code?: string }).code === 'EROFS') {
            console.warn("Local DB write skipped: Vercel Read-Only Filesystem.");
        } else {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.warn("Failed to write to local DB:", message);
        }
    }
};
