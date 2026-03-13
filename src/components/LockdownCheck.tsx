'use client';

import { useEffect, useState } from 'react';
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

    // Skip lockdown for admin pages and API routes
    const isAdminRoute = pathname.startsWith('/admin');

    useEffect(() => {
        if (isAdminRoute) {
            setChecked(true);
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch('/api/site-status', { cache: 'no-store' });
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
        };

        checkStatus();
    }, [pathname, isAdminRoute]);

    // Show nothing until the check completes (prevents flash of content)
    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-8 h-8 border-4 border-gray-700 border-t-gray-400 rounded-full animate-spin" />
            </div>
        );
    }

    // Admin routes always bypass lockdown
    if (isAdminRoute) {
        return <>{children}</>;
    }

    // Show lockdown screen if active
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
