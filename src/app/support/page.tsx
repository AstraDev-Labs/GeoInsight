import type { Metadata } from 'next';
import SupportClient from '@/components/SupportClient';

export const metadata: Metadata = {
    title: "Support Center | Help & Resources",
    description: "Need help with Earth observation research or GIS data submissions? Contact GeoForesight support for assistance with account management, research publication, and satellite analysis queries.",
    alternates: {
        canonical: '/support',
    },
};

export default function SupportPage() {
    return (
        <>
            {/* Visually hidden H1 for SEO bots that struggle with client-side rendering */}
            <h1 className="sr-only">GeoForesight Support Center - Earth Observation & GIS Help</h1>
            <SupportClient />
        </>
    );
}
