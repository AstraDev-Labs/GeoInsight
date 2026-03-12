import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from 'next-axiom';
import { SITE_URL } from "@/lib/constants";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  title: {
    default: "GeoInsights | Remote Sensing & GIS Intelligence Platform",
    template: "%s | GeoInsights",
  },
  description: "A collaborative intelligence platform for Remote Sensing and GIS professionals. Publish and discover research on satellite imagery, land cover change, hydrology, urban GIS, LiDAR, SAR, NDVI, precision agriculture, flood mapping, disaster management, and 70+ geospatial research domains.",
  keywords: [
    // Core RS & GIS
    "remote sensing",
    "GIS",
    "geographic information system",
    "geospatial analysis",
    "satellite imagery",
    "earth observation",
    "geoinformatics",
    "geospatial intelligence",
    // Sensing Technologies
    "NDVI",
    "EVI",
    "LiDAR",
    "SAR",
    "synthetic aperture radar",
    "multispectral analysis",
    "hyperspectral remote sensing",
    "thermal remote sensing",
    "UAV drone mapping",
    "photogrammetry",
    // Land & Vegetation
    "land cover change",
    "LULC",
    "land use land cover",
    "deforestation monitoring",
    "vegetation index",
    "forestry remote sensing",
    "soil analysis GIS",
    // Water & Climate
    "hydrology GIS",
    "watershed analysis",
    "flood mapping",
    "climate analysis",
    "oceanography remote sensing",
    "glacier monitoring",
    "water quality GIS",
    // Agriculture
    "agriculture remote sensing",
    "precision agriculture",
    "crop monitoring satellite",
    // Urban & Infrastructure
    "urban GIS",
    "urban heat island",
    "smart city GIS",
    "transportation GIS",
    "building footprint extraction",
    // Environment & Hazards
    "environmental monitoring",
    "disaster risk management",
    "wildfire detection",
    "landslide mapping",
    "air quality remote sensing",
    // Terrain & Geology
    "DEM terrain analysis",
    "geological mapping",
    "geomorphology",
    "bathymetry",
    "topographic survey",
    // Spatial Analysis
    "spatial data analysis",
    "geostatistics",
    "machine learning remote sensing",
    "deep learning GIS",
    "change detection satellite",
    "image classification",
    "object detection OBIA",
    // Technology
    "Google Earth Engine",
    "QGIS",
    "ArcGIS",
    "web GIS",
    "cloud GIS",
    "geodatabase",
    // Applications
    "biodiversity GIS",
    "health GIS epidemiology",
    "renewable energy siting GIS",
    "mining resource mapping",
    "GPS GNSS",
    "geodesy",
    "remote sensing blog",
    "GIS research platform",
  ],
  authors: [{ name: "GeoInsights Team" }],
  creator: "GeoInsights",
  publisher: "GeoInsights",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GeoInsights",
    title: "GeoInsights | Remote Sensing & GIS Intelligence Platform",
    description: "A collaborative intelligence platform for sharing spatial findings, environmental insights, and GIS research.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GeoInsights - Remote Sensing & GIS Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GeoInsights | Remote Sensing & GIS Intelligence",
    description: "Explore cutting-edge GIS research, satellite analysis, and environmental intelligence.",
    images: ["/og-image.png"],
  },
  verification: {
    // Add your verification codes here after registering:
    // Google Search Console: https://search.google.com/search-console
    // Bing Webmaster Tools: https://www.bing.com/webmasters
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    yandex: '',
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    },
  },
  category: 'science',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GeoInsights",
              url: SITE_URL,
              description: "A collaborative intelligence platform for Remote Sensing and GIS research.",
              sameAs: [],
            }),
          }}
        />
        {/* Structured Data - WebSite for Sitelinks Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "GeoInsights",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${SITE_URL}/?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {children}
        <AxiomWebVitals />
        <SpeedInsights />
        <Analytics />
        {/* Cloudflare Web Analytics */}
        <Script src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "33dd9409d9164dfea9f791806a267e1e"}' strategy="afterInteractive" />
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}
