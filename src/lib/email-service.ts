import { SITE_URL } from "@/lib/constants";

/**
 * GeoForesight Email Identity Utility
 * Handles sending emails from different verified identities using Resend.
 */

const SITE_NAME = 'GeoForesight';

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
        email: 'updates@geoforesight.org' // Changed from no-reply to updates as per user request
    }
};

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Beautiful HTML email template
function wrapTemplate(content: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">
                                                ${SITE_NAME}
                                            </h1>
                                            <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 2px;">
                                                Remote Sensing & GIS Intelligence
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                ${content}
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.3);">
                                    © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
                                </p>
                                <p style="margin: 8px 0 0; font-size: 11px; color: rgba(255,255,255,0.2);">
                                    This is an automated notification. Please do not reply directly to this email.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}

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
        console.error("❌ ERROR: RESEND_API_KEY is not set in environment variables.");
        return { success: false, message: 'Configuration error: Email API Key missing.' };
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
            console.error('❌ Resend API Error:', {
                status: response.status,
                statusText: response.statusText,
                data,
                identity,
                to
            });
            return { 
                success: false, 
                message: data.message || `Resend error: ${response.status} ${response.statusText}` 
            };
        }

        console.log('✅ Email sent successfully via Resend:', {
            id: data.id,
            identity,
            to
        });
        return { success: true, data };
    } catch (error) {
        console.error('❌ Email Delivery Failed (Exception):', error);
        return { success: false, message: 'Network error or internal exception while sending email' };
    }
}

// --- Specific Notification Functions ---

export async function sendPublishedEmail(authorEmail: string, authorName: string, postTitle: string, postId: string): Promise<boolean> {
    const postUrl = `${SITE_URL}/blog/${postId}`;
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #10b981; font-size: 28px; font-weight: 700; margin: 0;">Publication Approved!</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong>${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            Great news! Your research submission has been reviewed and <strong style="color: #10b981;">approved for publication</strong> on ${SITE_NAME}.
        </p>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: white;">${escapeHtml(postTitle)}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${postUrl}" style="display: inline-block; background: #38bdf8; color: #0f172a; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                View Your Publication →
            </a>
        </div>
    `);

    const result = await sendEmail({
        identity: 'updates',
        to: authorEmail,
        subject: `Your research "${postTitle}" has been published!`,
        text: `Hello ${authorName}, your research "${postTitle}" has been published! View it at: ${postUrl}`,
        html,
    });
    return result.success;
}

export async function sendDeclinedEmail(authorEmail: string, authorName: string, postTitle: string, reason?: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #f59e0b; font-size: 28px; font-weight: 700; margin: 0;">Submission Update</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong>${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            After careful review, your research submission was <strong>not approved</strong> for publication at this time.
        </p>
        ${reason ? `
        <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">${escapeHtml(reason)}</p>
        </div>
        ` : ''}
    `);

    const result = await sendEmail({
        identity: 'updates',
        to: authorEmail,
        subject: `Update on your submission "${postTitle}"`,
        text: `Hello ${authorName}, your submission "${postTitle}" was not approved. Reason: ${reason || 'No specific reason provided.'}`,
        html,
    });
    return result.success;
}

export async function sendSubmissionReceivedEmail(authorEmail: string, authorName: string, postTitle: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #38bdf8; font-size: 28px; font-weight: 700; margin: 0;">Submission Received</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong>${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            Your research submission has been securely received and is now <strong>queued for review</strong>.
        </p>
    `);

    const result = await sendEmail({
        identity: 'updates',
        to: authorEmail,
        subject: `Submission received: "${postTitle}"`,
        text: `Hello ${authorName}, we have received your submission "${postTitle}" and it is now queued for review.`,
        html,
    });
    return result.success;
}

export async function sendCommentVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #38bdf8; font-size: 26px; font-weight: 700; margin: 0;">Verify Your Account</h2>
        </div>
        <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: 6px; color: white;">${code}</p>
        </div>
    `);

    const result = await sendEmail({
        identity: 'updates',
        to: email,
        subject: `Verification code: ${code}`,
        text: `Hello ${name}, your verification code is: ${code}`,
        html,
    });
    return result.success;
}
