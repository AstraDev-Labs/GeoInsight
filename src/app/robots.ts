import { MetadataRoute } from 'next';

const SITE_URL = 'https://geo-insight-seven.vercel.app';

export const revalidate = 0;

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/api/'],
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: ['/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
