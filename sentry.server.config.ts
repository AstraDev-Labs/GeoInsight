import * as Sentry from "@sentry/nextjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
        // Add profiling integration
        nodeProfilingIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Profiling sample rate is relative to tracesSampleRate
    profilesSampleRate: 1.0,

    debug: false,
});
