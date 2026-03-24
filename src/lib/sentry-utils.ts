import * as Sentry from "@sentry/nextjs";

/**
 * Custom Metrics help you track business-level data.
 */
export const metrics = {
    /**
     * Increments a counter by a given value.
     */
    count: (name: string, value: number = 1, tags?: Record<string, string>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const m = (Sentry as any).metrics;
            if (m && typeof m.count === 'function') {
                m.count(name, value, { tags });
            } else {
                // Fallback for different SDK versions
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (Sentry as any).metrics?.increment?.(name, value, { tags });
            }
        } catch (err) {
            console.warn("[Sentry Metrics] Failed to send metric:", name, err);
        }
    },

    /**
     * Alias for count.
     */
    increment: (name: string, value: number = 1, tags?: Record<string, string>) => {
        metrics.count(name, value, tags);
    },

    /**
     * Records a distribution (averages, percentiles).
     */
    distribution: (name: string, value: number, tags?: Record<string, string>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Sentry as any).metrics?.distribution(name, value, { tags });
        } catch (err) {
            console.warn("[Sentry Metrics] Failed to send distribution:", name, err);
        }
    },

    /**
     * Records a gauge (current value).
     */
    gauge: (name: string, value: number, tags?: Record<string, string>) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Sentry as any).metrics?.gauge(name, value, { tags });
        } catch (err) {
            console.warn("[Sentry Metrics] Failed to send gauge:", name, err);
        }
    },
};

/**
 * Capture a custom log message.
 */
export const log = (message: string, level: Sentry.SeverityLevel = "info") => {
    Sentry.addBreadcrumb({
        category: "app",
        message: message,
        level: level,
    });
    console.log(`[AppLog] ${message}`);
};

