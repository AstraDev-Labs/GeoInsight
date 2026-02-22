import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token exists and hasn't expired
    const tokens = globalThis.__adminTokens || {};
    const expiry = tokens[token];

    if (!expiry || Date.now() > expiry) {
        // Token expired or invalid
        if (expiry) delete tokens[token];
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
}
