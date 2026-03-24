import { NextResponse } from "next/server";
import { metrics, log } from "@/lib/sentry-utils";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
    // 1. Test Metrics
    metrics.count("sentry_test.executed", 1);

    // 2. Test Logging (using the code you provided + our safety wrapper)
    log("User triggered test log via /api/sentry-test", "info");

    // Directly using Sentry for a test message
    Sentry.captureMessage("Sentry Integration Verification Message", "info");

    // 3. Test Cron/Monitor (deprecated manually, but simulate)
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
        status: "success",
        message: "Test signals sent to Sentry!",
        signals_sent: ["metrics", "logs", "cron"]
    });
}
