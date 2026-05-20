import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth-util";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

    if (!token || !verifyAdminToken(token, adminPassword)) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
}
