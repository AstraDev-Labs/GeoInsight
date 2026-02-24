import { dataService } from '@/lib/data-service';
import { MetadataRoute } from 'next';

const SITE_URL = 'https://geo-insight-seven.vercel.app';

// Set a longer revalidate period for stability
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date().toISOString().split('T')[0];
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/request-post`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/support`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic blog post pages
    const posts = await dataService.getPosts();
    const publishedPosts = posts.filter(p => p.status === 'published');

    const blogPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
        url: `${SITE_URL}/blog/${post.id}`,
        lastModified: (post.postedAt ? new Date(post.postedAt) : new Date(post.date)).toISOString().split('T')[0],
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Dynamic author profile pages
    const uniqueAuthors = [...new Set(publishedPosts.map(p => p.author))];
    const authorPages: MetadataRoute.Sitemap = uniqueAuthors.map(author => {
        const authorPosts = publishedPosts.filter((post) => post.author === author);
        const latest = authorPosts
            .map((post) => new Date(post.postedAt || post.date).getTime())
            .filter((value) => !Number.isNaN(value))
            .sort((a, b) => b - a)[0];
        return {
            url: `${SITE_URL}/author/${encodeURIComponent(author)}`,
            lastModified: latest ? new Date(latest).toISOString().split('T')[0] : now,
            changeFrequency: 'weekly' as const,
            priority: 0.5,
        };
    });

    return [...staticPages, ...blogPages, ...authorPages];
}
