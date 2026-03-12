import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Log Finding | Submit Research',
    description: 'Submit your analytical findings and remote sensing research to the GeoForesight global network.',
    alternates: {
        canonical: '/request-post',
    },
};

export default function RequestPostLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

