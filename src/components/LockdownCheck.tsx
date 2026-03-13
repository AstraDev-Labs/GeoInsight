'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import LockdownScreen from '@/components/LockdownScreen';
import type { LockdownMode } from '@/lib/types';

interface LockdownCheckProps {
    children: React.ReactNode;
}

export default function LockdownCheck({ children }: LockdownCheckProps) {
    const pathname = usePathname();
    const [lockdownMode, setLockdownMode] = useState<LockdownMode>('none');
    const [lockdownMessage, setLockdownMessage] = useState<string>();
    const [checked, setChecked] = useState(false);

    const isAdminRoute = pathname.startsWith('/admin');

    const checkStatus = useCallback(async () => {
        if (isAdminRoute) {
            setChecked(true);
            return;
        }

        try {
            // Cache-busting timestamp to bypass any CDN/browser caching
            const res = await fetch(`/api/site-status?_t=${Date.now()}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' },
            });
            if (res.ok) {
                const data = await res.json();
                setLockdownMode(data.lockdownMode || 'none');
                setLockdownMessage(data.lockdownMessage);
            }
        } catch {
            // On error, allow access (fail-open)
        } finally {
            setChecked(true);
        }
    }, [isAdminRoute]);

    // Check on mount, on every navigation, and poll every 30s
    useEffect(() => {
        checkStatus();

        if (!isAdminRoute) {
            const interval = setInterval(checkStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [pathname, checkStatus, isAdminRoute]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
            </div>
        );
    }

    if (isAdminRoute) {
        return <>{children}</>;
    }

    if (lockdownMode && lockdownMode !== 'none') {
        return (
            <LockdownScreen
                mode={lockdownMode}
                message={lockdownMessage}
            />
        );
    }

    return <>{children}</>;
}
