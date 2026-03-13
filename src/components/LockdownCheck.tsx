import { dataService } from '@/lib/data-service';
import LockdownScreen from '@/components/LockdownScreen';
import { headers } from 'next/headers';

interface LockdownCheckProps {
    children: React.ReactNode;
}

export default async function LockdownCheck({ children }: LockdownCheckProps) {
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '/';

    // Allow admin routes and API routes to bypass lockdown
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
        return <>{children}</>;
    }

    try {
        const settings = await dataService.getSiteSettings();

        if (settings.lockdownMode && settings.lockdownMode !== 'none') {
            return (
                <LockdownScreen
                    mode={settings.lockdownMode}
                    message={settings.lockdownMessage}
                />
            );
        }
    } catch (error) {
        console.error('Failed to check lockdown status:', error);
        // On error, allow access (fail-open)
    }

    return <>{children}</>;
}
