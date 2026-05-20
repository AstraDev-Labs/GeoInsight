'use client';

import type { BlogPost, PostRequest } from '@/lib/types';

type Props = {
    posts: BlogPost[];
    requests: PostRequest[];
};

const daysAgoKey = (dateValue: string, days: number, anchor: number): boolean => {
    const value = new Date(dateValue);
    if (Number.isNaN(value.getTime())) return false;
    const threshold = anchor - days * 24 * 60 * 60 * 1000;
    return value.getTime() >= threshold;
};

export default function AdminAnalyticsPanel({ posts, requests }: Props) {
    const published = posts.filter((post) => post.status === 'published');
    const latestPublishedAt = published
        .map((post) => new Date(post.postedAt || post.date).getTime())
        .filter((value) => !Number.isNaN(value))
        .sort((a, b) => b - a)[0] || 0;
    const publishedLast7Days = published.filter((post) => daysAgoKey(post.postedAt || post.date, 7, latestPublishedAt)).length;
    const publishedPrev7Days = published.filter((post) => {
        const value = new Date(post.postedAt || post.date).getTime();
        return value < latestPublishedAt - 7 * 24 * 60 * 60 * 1000 && value >= latestPublishedAt - 14 * 24 * 60 * 60 * 1000;
    }).length;
    const growthPercent = publishedPrev7Days === 0
        ? (publishedLast7Days > 0 ? 100 : 0)
        : Math.round(((publishedLast7Days - publishedPrev7Days) / publishedPrev7Days) * 100);

    const categoryCounts = new Map<string, number>();
    published.forEach((post) => {
        post.category
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
            .forEach((category) => {
                categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
            });
    });
    const topCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const authorCounts = new Map<string, number>();
    published.forEach((post) => {
        authorCounts.set(post.author, (authorCounts.get(post.author) || 0) + 1);
    });
    const topAuthors = Array.from(authorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const acceptedRequests = requests.filter((request) => request.status === 'accepted').length;
    const deniedRequests = requests.filter((request) => request.status === 'denied').length;
    const pendingRequests = requests.filter((request) => request.status === 'pending').length;

    return (
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 xl:col-span-2">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-[#666] mb-4">Category Distribution</h3>
                <div className="space-y-3">
                    {topCategories.length === 0 ? (
                        <p className="text-sm text-[#666]">No published category data yet.</p>
                    ) : (
                        topCategories.map(([name, count]) => {
                            const ratio = Math.max(8, Math.round((count / published.length) * 100));
                            return (
                                <div key={name}>
                                    <div className="flex justify-between text-xs font-semibold text-[#444] mb-1">
                                        <span>{name}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                                        <div className="h-2 bg-[#006699] rounded-full" style={{ width: `${ratio}%` }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-[#666] mb-4">7-Day Throughput</h3>
                <p className="text-3xl font-bold text-[#222] mb-1">{publishedLast7Days}</p>
                <p className={`text-xs font-semibold ${growthPercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {growthPercent >= 0 ? '+' : ''}{growthPercent}% vs previous 7 days
                </p>
                <div className="mt-4 pt-4 border-t text-xs text-[#666]">
                    Pending requests: <span className="font-bold text-[#222]">{pendingRequests}</span>
                </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-[#666] mb-4">Top Contributors</h3>
                <div className="space-y-2">
                    {topAuthors.length === 0 ? (
                        <p className="text-sm text-[#666]">No contributor data yet.</p>
                    ) : (
                        topAuthors.map(([name, count]) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                                <span className="text-[#444] truncate pr-4">{name}</span>
                                <span className="font-bold text-[#222]">{count}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 xl:col-span-2">
                <h3 className="text-sm uppercase tracking-wider font-semibold text-[#666] mb-4">Request Status Funnel</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold uppercase text-amber-700 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-[#222]">{pendingRequests}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold uppercase text-emerald-700 mb-1">Accepted</p>
                        <p className="text-2xl font-bold text-[#222]">{acceptedRequests}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-xs font-semibold uppercase text-red-700 mb-1">Denied</p>
                        <p className="text-2xl font-bold text-[#222]">{deniedRequests}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
