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
