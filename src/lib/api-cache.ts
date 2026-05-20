type CacheEntry = {
    data: unknown;
    expiresAt: number;
};

const apiCache = new Map<string, CacheEntry>();

export function getApiCache(key: string): CacheEntry | undefined {
    return apiCache.get(key);
}

export function setApiCache(key: string, data: unknown, ttlMs: number): void {
    apiCache.set(key, {
        data,
        expiresAt: Date.now() + ttlMs,
    });
}

function invalidateByPrefix(prefix: string): void {
    for (const key of apiCache.keys()) {
        if (key.startsWith(prefix)) {
            apiCache.delete(key);
        }
    }
}

export function invalidatePostsCache(): void {
    invalidateByPrefix('posts:');
}

export function invalidateRequestsCache(): void {
    invalidateByPrefix('requests:');
}
