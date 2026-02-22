import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Admin password stored as env var (should be a bcrypt hash in production)
        const adminPassword = process.env.ADMIN_PASSWORD || "";

        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: "Server configuration error" },
                { status: 500 }
            );
        }

        const isMatch = await bcrypt.compare(password, adminPassword);

        if (isMatch) {
            // Generate a session token
            const token = crypto.randomBytes(32).toString("hex");
            const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

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

            // Also store the token hash server-side for validation
            // Using a simple approach: store in a global (for production, use Redis/DB)
            globalThis.__adminTokens = globalThis.__adminTokens || {};
            globalThis.__adminTokens[token] = expiry;

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
