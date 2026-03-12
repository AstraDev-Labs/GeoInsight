import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Support Center | GeoForesights',
    description: 'Get help with your GeoForesights submissions, account, or any other questions you may have.',
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

