import crypto from 'crypto';

/**
 * Basic stateless session management using HMAC for Vercel transparency.
 * We use the ADMIN_PASSWORD as the secret key.
 */

export function generateAdminToken(adminPassword: string): string {
    const timestamp = Date.now().toString();
    const hmac = crypto.createHmac('sha256', adminPassword);
    hmac.update(timestamp);
    const signature = hmac.digest('hex');
    return `${timestamp}.${signature}`;
}

export function verifyAdminToken(token: string | undefined, adminPassword: string): boolean {
    if (!token) return false;

    const [timestamp, signature] = token.split('.');
    if (!timestamp || !signature) return false;

    // Check if token has expired (24 hour limit)
    const tokenTime = parseInt(timestamp);
    if (isNaN(tokenTime) || Date.now() - tokenTime > 24 * 60 * 60 * 1000) {
        return false;
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', adminPassword);
    hmac.update(timestamp);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
}

const COMMENT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type CommentSession = {
    name: string;
    role: 'user' | 'bot' | 'admin';
    userId?: string;
    commenterKey?: string;
    timestamp: number;
};

const encodeBase64Url = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const getCommentAuthSecret = (): string => {
    return (
        (process.env.COMMENT_AUTH_SECRET || '').trim() ||
        (process.env.ADMIN_PASSWORD || '').trim() ||
        'geoinsight-comment-secret'
    );
};

export function generateCommentToken(session: Omit<CommentSession, 'timestamp'>): string {
    const payload: CommentSession = { ...session, timestamp: Date.now() };
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', getCommentAuthSecret())
        .update(encodedPayload)
        .digest('hex');

    return `${encodedPayload}.${signature}`;
}

export function verifyCommentToken(token: string | undefined): CommentSession | null {
    if (!token) return null;

    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expected = crypto
        .createHmac('sha256', getCommentAuthSecret())
        .update(encodedPayload)
        .digest('hex');

    if (expected !== signature) return null;

    try {
        const payload = JSON.parse(decodeBase64Url(encodedPayload)) as CommentSession;
        if (!payload?.name || !payload?.role || !payload?.timestamp) return null;
        if (!['user', 'bot', 'admin'].includes(payload.role)) return null;
        if (Date.now() - payload.timestamp > COMMENT_SESSION_TTL_MS) return null;
        return payload;
    } catch {
        return null;
    }
}
