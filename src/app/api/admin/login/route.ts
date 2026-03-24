import { NextResponse } from "next/server";
import { generateAdminToken } from "@/lib/auth-util";
import { verifyTurnstileToken } from "@/lib/turnstile-util";

export async function POST(request: Request) {
    try {
        const { password, turnstileToken } = await request.json();

        // Verify Turnstile Token first to prevent brute-force
        const isHuman = await verifyTurnstileToken(turnstileToken);
        if (!isHuman) {
            return NextResponse.json(
                { success: false, message: "Security check failed. Please try again." },
                { status: 403 }
            );
        }

        // Admin password stored as env var
        const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

        if (password === adminPassword) {
            // Generate a session token
            const token = generateAdminToken(adminPassword);

            // Store token in a cookie
            const response = NextResponse.json({
                success: true,
                message: "Authentication successful"
            });

            response.cookies.set("admin_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 86400, // 24 hours
                path: "/",
            });

            return response;
        }

        return NextResponse.json(
            { success: false, message: "Invalid password" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
