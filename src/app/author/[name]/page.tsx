import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { dataService } from '@/lib/data-service';
import type { BlogPost } from '@/lib/types';
import { Calendar, User, Map } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://geo-insight-seven.vercel.app';
type BlogPostWithLegacyImage = BlogPost & { imageUrl?: string };

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    // Use relative path for canonical, Next.js will use metadataBase from layout.tsx
    const canonicalPath = `/author/${encodeURIComponent(decodedName)}`;
    const fullCanonicalUrl = `${SITE_URL}${canonicalPath}`;

    return {
        title: `${decodedName} | Author`,
        description: `Research profile and published findings of ${decodedName} on GeoInsights.`,
        alternates: {
            canonical: canonicalPath,
        },
        openGraph: {
            title: `${decodedName} | GeoInsights Author`,
            description: `Published findings by ${decodedName}.`,
            type: 'profile',
            url: fullCanonicalUrl,
        },
    };
}

export default async function AuthorProfile({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    const allPosts = await dataService.getPosts() as BlogPostWithLegacyImage[];
    const authorPosts = allPosts.filter(p => p.status === 'published' && p.author.toLowerCase() === decodedName.toLowerCase());

    return (
        <main className="min-h-screen flex flex-col bg-white text-black overflow-hidden relative pb-0 font-sans">
            <div className="bg-[#1a1a1a] shadow-md z-20 relative w-full">
                <Navbar />
            </div>

            <div className="pt-16 pb-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10 flex-1">
                <div className="flex flex-col items-center justify-center text-center mb-16">
                    <div className="w-24 h-24 bg-[#f0f0f0] rounded-none flex items-center justify-center text-[#222] mb-6 border border-[#e5e5e5]">
                        <User size={48} className="text-[#006699]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-[#222]">{decodedName}</h1>
                    <p className="text-[#666] text-lg uppercase tracking-widest text-sm font-bold">
                        Contributing Researcher
                        <span className="mx-3 text-[#ccc]">•</span>
                        {authorPosts.length} Published Findings
                    </p>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-[#e5e5e5] pb-4 flex items-center gap-3 font-serif text-[#222]">
                        <span className="w-6 h-1 bg-[#006699] rounded-none" />
                        Research Portfolio
                    </h2>

                    {authorPosts.length === 0 ? (
                        <div className="text-center py-12 text-[#555] bg-[#f9f9f9] border border-[#e5e5e5] italic">
                            No publications found by this author.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {authorPosts.map(post => (
                                <div key={post.id} className="group border border-[#e5e5e5] bg-white transition-all flex flex-col h-full hover:shadow-md">
                                    <Link href={`/blog/${post.id}`} className="flex-1 flex flex-col">
                                        {(post.images && post.images.length > 0) || post.imageUrl ? (
                                            <div className="relative h-48 overflow-hidden bg-[#f0f0f0]">
                                                <img
                                                    src={post.images && post.images.length > 0 ? post.images[0] : post.imageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 left-4 bg-[#006699] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
                                                    {post.category}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative h-48 bg-[#f4f4f4] flex flex-col items-center justify-center border-b border-[#e5e5e5]">
                                                <div className="absolute top-4 left-4 bg-[#222] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest">
                                                    {post.category}
                                                </div>
                                                <Map className="w-16 h-16 text-[#ccc]" />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-[1.3rem] font-bold mb-3 leading-[1.3] text-[#222] group-hover:text-[#006699] transition-colors font-serif line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-[#555] text-[0.95rem] line-clamp-3 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="px-6 pb-6 mt-auto flex items-center gap-2 text-xs font-bold text-[#888] uppercase tracking-widest border-[#e5e5e5] pt-4">
                                        <Calendar size={14} className="text-[#888]" />
                                        {post.postedAt ? new Date(post.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : post.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
