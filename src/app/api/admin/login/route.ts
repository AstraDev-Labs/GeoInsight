import { NextResponse } from "next/server";
import { generateAdminToken } from "@/lib/auth-util";

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Admin password stored as env var
        const adminPassword = (process.env.ADMIN_PASSWORD || "Astradevs@2026").trim();

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
