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

    const isAdminRoute = pathname.startsWith('/admin');

    const checkStatus = useCallback(async () => {
        if (isAdminRoute) return;

        try {
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
        }
    }, [isAdminRoute]);

    // Check on mount, on navigation, and poll every 30s
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkStatus();

        if (!isAdminRoute) {
            const interval = setInterval(checkStatus, 30000);
            return () => clearInterval(interval);
        }
    }, [pathname, checkStatus, isAdminRoute]);

    // Admin routes always bypass lockdown
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Show lockdown screen if active (no spinner — zero delay for normal visits)
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
