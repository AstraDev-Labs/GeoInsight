import { dataService } from '@/lib/data-service';
import { SITE_URL } from '@/lib/constants';
import type { MetadataRoute } from 'next';
import type { BlogPost } from '@/lib/types';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts: BlogPost[] = await dataService.getPosts();

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${SITE_URL}/request-post`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/support`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    const postPages: MetadataRoute.Sitemap = posts.map((post: BlogPost) => ({
        url: `${SITE_URL}/blog/${slugify(post.title)}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // Get unique author names
    const authors = [...new Set(posts.map((p: BlogPost) => p.author))];
    const authorPages: MetadataRoute.Sitemap = authors.map((author: string) => ({
        url: `${SITE_URL}/author/${encodeURIComponent(author)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    return [...staticPages, ...postPages, ...authorPages];
}
