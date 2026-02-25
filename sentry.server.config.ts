import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
        nodeProfilingIntegration(),
        // Capture server-side console logs
        Sentry.captureConsoleIntegration({
            levels: ['error', 'warn', 'log', 'info', 'debug'],
        }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Profiling
    profilesSampleRate: 1.0,

    debug: false,
});
