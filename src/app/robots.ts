import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://geoinsights.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin', '/api/'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/admin', '/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
