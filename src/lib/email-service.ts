/**
 * GeoForesight Email Identity Utility
 * Handles sending emails from different verified identities using Resend.
 */

export type EmailIdentity = 'support' | 'updates' | 'team' | 'notifications';

const IDENTITIES: Record<EmailIdentity, { name: string; email: string }> = {
    support: {
        name: 'GeoForesight Support',
        email: 'support@geoforesight.org'
    },
    updates: {
        name: 'GeoForesight Updates',
        email: 'updates@geoforesight.org'
    },
    team: {
        name: 'GeoForesight Team',
        email: 'team@geoforesight.org'
    },
    notifications: {
        name: 'GeoForesight',
        email: 'no-reply@geoforesight.org'
    }
};

export async function sendEmail({
    identity = 'notifications',
    to,
    subject,
    text,
    replyTo,
    html
}: {
    identity?: EmailIdentity;
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
    html?: string;
}) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn(`[Email Simulation] From: ${IDENTITIES[identity].email} To: ${to} Subject: ${subject}`);
        return { success: true, message: 'Simulated success (API Key missing)' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                from: `${IDENTITIES[identity].name} <${IDENTITIES[identity].email}>`,
                to: [to],
                subject,
                text,
                html,
                reply_to: replyTo
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend Error:', data);
            throw new Error(data.message || 'Failed to send email');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email Delivery Failed:', error);
        return { success: false, error };
    }
}
