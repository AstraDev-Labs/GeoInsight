import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
        Sentry.browserProfilingIntegration(),
        // Capture all console logs for better debugging
        Sentry.captureConsoleIntegration({
            levels: ['error', 'warn', 'log', 'info', 'debug'],
        }),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Profiling
    profilesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    debug: false,
});
