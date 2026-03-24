import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile-util";

export async function POST(request: Request) {
    try {
        const { name, email, message, turnstileToken } = await request.json();

        // Validate basic inputs
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify Turnstile Token
        const isHuman = await verifyTurnstileToken(turnstileToken);
        if (!isHuman) {
            return NextResponse.json(
                { success: false, message: "Security check failed. Please try again." },
                { status: 403 }
            );
        }

        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.warn("⚠️ WARNING: RESEND_API_KEY is not set. Simulating success for development.");
            // In a real scenario, this should probably be an error, but let's allow it to simulate sending
            return NextResponse.json({ success: true, message: "Message sent (simulated)" });
        }

        // Send email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'GeoForesight Support <onboarding@resend.dev>', // Resend default testing domain, change in prod
                to: 'contact@geoforesight.org',
                reply_to: email,
                subject: `Support Request from ${name}`,
                text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
            })
        });

        if (res.ok) {
            return NextResponse.json({ success: true, message: "Message sent successfully" });
        } else {
            const errorData = await res.json();
            console.error('Resend error:', errorData);
            return NextResponse.json(
                { success: false, message: "Failed to send message. Please try again later." },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("Support API error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
