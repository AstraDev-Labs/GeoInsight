import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Terminal | GeoInsights',
    robots: {
        index: false,
        follow: false,
    },
    alternates: {
        canonical: '/admin',
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
