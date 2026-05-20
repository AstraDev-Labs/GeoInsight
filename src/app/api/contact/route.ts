import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        // Validate basic inputs
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Send email via new identity-aware service
        const result = await sendEmail({
            identity: 'support',
            to: 'GeoForesight.org@gmail.com', // Recipient
            replyTo: email,
            subject: `Support Request from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #006699;">New Support Request</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: "Message sent successfully" });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || "Failed to send message. Please try again later." },
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
