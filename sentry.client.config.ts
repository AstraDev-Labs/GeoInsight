import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    integrations: [
        // Replay allows you to see a video-like reproduction of errors
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
        // Browser Profiling allows you to see deep performance bottlenecks in the browser
        Sentry.browserProfilingIntegration(),
    ],

    // Performance Monitoring
    tracesSampleRate: 1.0,

    // Profiling sample rate is relative to tracesSampleRate
    profilesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    debug: false,
});
