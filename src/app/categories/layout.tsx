import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Research Vectors | Geospatial Categories',
    description: 'Explore Earth observation intelligence across various research vectors including land cover, hydrology, agriculture, and urban GIS.',
    alternates: {
        canonical: '/categories',
    },
};

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
