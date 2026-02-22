import { dataService } from '@/lib/data-service';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://geoinsights.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/request-post`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/support`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ];

    // Dynamic blog post pages
    const posts = await dataService.getPosts();
    const publishedPosts = posts.filter(p => p.status === 'published');

    const blogPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
        url: `${SITE_URL}/blog/${post.id}`,
        lastModified: post.postedAt ? new Date(post.postedAt) : new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic author profile pages
    const uniqueAuthors = [...new Set(publishedPosts.map(p => p.author))];
    const authorPages: MetadataRoute.Sitemap = uniqueAuthors.map(author => ({
        url: `${SITE_URL}/author/${encodeURIComponent(author)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    return [...staticPages, ...blogPages, ...authorPages];
}
