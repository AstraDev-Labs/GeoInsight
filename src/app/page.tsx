import { Suspense } from 'react';
import HomeClient from '@/components/HomeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "GeoForesight | Remote Sensing & GIS Intelligence Feed",
  description: "Explore the latest research findings in Remote Sensing, GIS, and Earth Observation. Our intelligence feed provides collaborative insights into satellite telemetry, environmental monitoring, and geospatial data analysis.",
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* Visually hidden H1 for SEO/GEO bots that struggle with client-side rendering */}
      <h1 className="sr-only">GeoForesight Research Intelligence and Remote Sensing Feed</h1>
      
      <Suspense fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </main>
      }>
        <HomeClient />
      </Suspense>
    </>
  );
}
