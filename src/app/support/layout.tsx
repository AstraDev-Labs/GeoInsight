import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support Center | GeoInsights',
    description: 'Get help with your GeoInsights submissions, account, or any other questions you may have.',
    alternates: {
        canonical: '/support',
    },
};

export default function SupportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
