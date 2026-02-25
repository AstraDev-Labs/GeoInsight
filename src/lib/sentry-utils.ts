import * as Sentry from "@sentry/nextjs";

/**
 * Custom Metrics help you track business-level data like "how many posts were created"
 * or "how many search results were returned".
 */
export const metrics = {
    /**
     * Increments a counter by a given value.
     */
    count: (name: string, value: number = 1, tags?: Record<string, string>) => {
        // Cast to any to bypass a known typing issue in @sentry/nextjs v10
        (Sentry.metrics as any).count(name, value, { tags });
    },

    /**
     * Alias for count, as used in previous versions or other SDKs.
     */
    increment: (name: string, value: number = 1, tags?: Record<string, string>) => {
        (Sentry.metrics as any).increment(name, value, { tags });
    },

    /**
     * Records a distribution (averages, percentiles). Useful for timing or sizes.
     */
    distribution: (name: string, value: number, tags?: Record<string, string>) => {
        (Sentry.metrics as any).distribution(name, value, { tags });
    },

    /**
     * Records a gauge (current value). Useful for memory or queue sizes.
     */
    gauge: (name: string, value: number, tags?: Record<string, string>) => {
        (Sentry.metrics as any).gauge(name, value, { tags });
    },
};

/**
 * Capture a custom log message as a breadcrumb or standalone event.
 */
export const log = (message: string, level: Sentry.SeverityLevel = "info") => {
    Sentry.addBreadcrumb({
        category: "app",
        message: message,
        level: level,
    });
    console.log(`[AppLog] ${message}`);
};

/**
 * Monitoring for Cron jobs. Wrap your cron task logic with this.
 */
export const withCronMonitor = async <T>(
    monitorSlug: string,
    callback: () => Promise<T>
): Promise<T> => {
    return await Sentry.withMonitor(monitorSlug, callback);
};
