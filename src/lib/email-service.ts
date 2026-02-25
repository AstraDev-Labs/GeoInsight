import nodemailer from 'nodemailer';

// Email configuration - uses SMTP credentials from .env.local
// For production, use AWS SES, SendGrid, or similar
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@geoinsights.com';
import { SITE_URL } from "@/lib/constants";
const SITE_NAME = 'GeoInsights';

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // If SMTP is not configured, log and skip
    if (!user || !pass) {
        console.warn('⚠️ SMTP credentials missing. Email skipped.');
        console.log('   Context:', { subject: options.subject, to: options.to });
        return false;
    }

    try {
        console.log(`📧 Attempting to send email to ${options.to}...`);

        const result = await transporter.sendMail({
            from: `"${SITE_NAME}" <${FROM_EMAIL}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log('✅ Email sent successfully!', {
            messageId: result.messageId,
            to: options.to,
            subject: options.subject
        });
        return true;
    } catch (error: unknown) {
        const err = error as { message?: string, code?: string, command?: string };
        console.error('❌ SMTP SEND ERROR:', {
            error: err.message || String(error),
            code: err.code,
            command: err.command,
            to: options.to,
            subject: options.subject
        });
        return false;
    }
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

// --- Email Templates ---

export async function sendPublishedEmail(authorEmail: string, authorName: string, postTitle: string, postId: string): Promise<boolean> {
    const postUrl = `${SITE_URL}/blog/${postId}`;
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
                <tr>
                    <td style="width: 64px; height: 64px; background-color: #10b98126; border-radius: 50%; text-align: center; vertical-align: middle;">
                        <span style="font-size: 28px; font-weight: 900; color: #10b981; line-height: 64px;">&#10003;</span>
                    </td>
                </tr>
            </table>
            <h2 style="color: #10b981; font-size: 28px; font-weight: 700; margin: 0;">Publication Approved!</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong style="color: #38bdf8;">${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            Great news! Your research submission has been reviewed and <strong style="color: #10b981;">approved for publication</strong> on ${SITE_NAME}.
        </p>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Publication Title</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: white;">${escapeHtml(postTitle)}</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${postUrl}" style="display: inline-block; background: #38bdf8; color: #0f172a; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                View Your Publication →
            </a>
        </div>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6;">
            Your research is now live and accessible to all visitors. Thank you for contributing to the GeoInsights community!
        </p>
    `);

    return sendEmail({
        to: authorEmail,
        subject: `Your research "${postTitle}" has been published! - ${SITE_NAME}`,
        html,
    });
}

export async function sendDeclinedEmail(authorEmail: string, authorName: string, postTitle: string, reason?: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
                <tr>
                    <td style="width: 64px; height: 64px; background-color: #f59e0b26; border-radius: 50%; text-align: center; vertical-align: middle;">
                        <span style="font-size: 28px; font-weight: 900; color: #f59e0b; line-height: 64px;">!</span>
                    </td>
                </tr>
            </table>
            <h2 style="color: #f59e0b; font-size: 28px; font-weight: 700; margin: 0;">Submission Update</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong style="color: #38bdf8;">${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            After careful review, your research submission was <strong style="color: #f59e0b;">not approved</strong> for publication at this time.
        </p>
        <div style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Submission Title</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: white;">${escapeHtml(postTitle)}</p>
        </div>
        ${reason ? `
        <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #f59e0b; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Reviewer Notes</p>
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">${escapeHtml(reason)}</p>
        </div>
        ` : ''}
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6;">
            We encourage you to revise your research and resubmit. If you have questions, please reach out to the administration team.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${SITE_URL}/request-post" style="display: inline-block; background: rgba(255,255,255,0.1); color: white; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; border: 1px solid rgba(255,255,255,0.2);">
                Submit New Research
            </a>
        </div>
    `);

    return sendEmail({
        to: authorEmail,
        subject: `Update on your submission "${postTitle}" - ${SITE_NAME}`,
        html,
    });
}

export async function sendSubmissionReceivedEmail(authorEmail: string, authorName: string, postTitle: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 32px;">
            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 16px;">
                <tr>
                    <td style="width: 64px; height: 64px; background-color: #38bdf826; border-radius: 50%; text-align: center; vertical-align: middle;">
                        <span style="font-size: 28px; font-weight: 900; color: #38bdf8; line-height: 64px;">&#9993;</span>
                    </td>
                </tr>
            </table>
            <h2 style="color: #38bdf8; font-size: 28px; font-weight: 700; margin: 0;">Submission Received</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong style="color: #38bdf8;">${escapeHtml(authorName)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            Your research submission has been securely received and is now <strong style="color: #38bdf8;">queued for review</strong> by our administration team.
        </p>
        <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 4px; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;">Submission Title</p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: white;">${escapeHtml(postTitle)}</p>
        </div>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6;">
            You will receive another email once your submission has been reviewed. This process typically takes 24-48 hours.
        </p>
    `);

    return sendEmail({
        to: authorEmail,
        subject: `Submission received: "${postTitle}" - ${SITE_NAME}`,
        html,
    });
}

export async function sendCommentVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
    const html = wrapTemplate(`
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #38bdf8; font-size: 26px; font-weight: 700; margin: 0;">Verify Your Comment Account</h2>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6;">
            Hello <strong style="color: #38bdf8;">${escapeHtml(name)}</strong>,
        </p>
        <p style="color: rgba(255,255,255,0.7); font-size: 15px; line-height: 1.7;">
            Use the verification code below to activate your comment account.
        </p>
        <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-size: 30px; font-weight: 800; letter-spacing: 6px; color: white;">${code}</p>
        </div>
        <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 1.6;">
            This code expires in 15 minutes.
        </p>
    `);

    return sendEmail({
        to: email,
        subject: `Verify your comment account - ${SITE_NAME}`,
        html,
    });
}
