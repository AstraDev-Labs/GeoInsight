'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, ArrowRight, Activity, Globe2, Search, Filter, Clock, ShieldAlert, X as CloseIcon } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/mock-api';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';

export default function HomeClient() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [manualCategory, setManualCategory] = useState<string | null>(null);
    const [dismissedAlertKey, setDismissedAlertKey] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const searchParamKey = searchParams.toString();
    const queryCategory = searchParams.get('category') || 'All';
    const activeCategory = manualCategory ?? queryCategory;
    const hasAuthError = searchParams.get('auth_error') === 'invalid_access';
    const showAlert = hasAuthError && dismissedAlertKey !== searchParamKey;

    useEffect(() => {
        api.getPosts().then(publishedPosts => {
            setPosts(publishedPosts);
        });

    }, [searchParams]);

    useEffect(() => {
        if (!hasAuthError || dismissedAlertKey === searchParamKey) return;
        const timer = setTimeout(() => setDismissedAlertKey(searchParamKey), 5000);
        return () => clearTimeout(timer);
    }, [hasAuthError, dismissedAlertKey, searchParamKey]);

    const filteredPosts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const activeCatLower = activeCategory.toLowerCase();

        return posts.filter((post) => {
            const matchesSearch =
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                (post.areaOfInterest && post.areaOfInterest.toLowerCase().includes(query)) ||
                (post.satellite && post.satellite.toLowerCase().includes(query));

            const postCategories = post.category
                ? post.category.split(',').map(c => c.trim().toLowerCase())
                : [];
            const matchesCategory = activeCategory === 'All' ||
                postCategories.some(c => c === activeCatLower || c.includes(activeCatLower) || activeCatLower.includes(c));
            return matchesSearch && matchesCategory;
        });
    }, [posts, searchQuery, activeCategory]);

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
            <div className="w-full bg-background border-b z-20 relative">
                <Navbar />
            </div>

            {/* Floating Auth Alert */}
            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, y: -50, x: '-50%' }}
                        animate={{ opacity: 1, y: 100, x: '-50%' }}
                        exit={{ opacity: 0, y: -50, x: '-50%' }}
                        className="fixed left-1/2 z-[100] w-[90%] max-w-md"
                    >
                        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-lg p-4 shadow-lg flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">Security Intelligence Alert</p>
                                <p className="text-xs text-red-600">Invalid access attempt detected. Session denied.</p>
                            </div>
                            <button
                                onClick={() => setDismissedAlertKey(searchParamKey)}
                                className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <CloseIcon size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="relative z-10 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto pb-24 pt-16 w-full">
                {/* Main Header */}
                <div className="mb-16 border-b pb-12">
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Activity size={14} /> Mission Intelligence Feed
                    </div>
                    <h1 className="text-[3.5rem] md:text-[5.2rem] font-black tracking-tighter mb-6 text-foreground leading-[0.95]">
                        Research Findings
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                        A collaborative intelligence space for remote sensing peers to share findings, analyze satellite telemetry, and explore Earth observation research.
                    </p>
                </div>

                {/* Filter & Search Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-4">
                        <span className="w-8 h-[2px] bg-primary" />
                        Telemetry Stream
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-6 items-center w-full lg:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search missions, locations, or sensors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 text-sm font-medium"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative w-full sm:w-64 group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <select
                                value={activeCategory}
                                onChange={(e) => setManualCategory(e.target.value)}
                                className="w-full bg-background border rounded-xl pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer transition-all"
                            >
                                <option value="All">All Intelligence</option>
                                {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                                    <optgroup key={group} label={group} className="bg-background text-muted-foreground font-bold">
                                        {vectors.map((v: string) => (
                                            <option key={v} value={v} className="text-foreground bg-background">{v}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="w-full text-center py-24 px-8 border border-dashed rounded-2xl bg-muted/30">
                        <p className="text-xl font-bold text-foreground mb-3">No missions reported yet.</p>
                        <p className="text-muted-foreground">Incoming telemetry requested. Be the first to submit a report.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredPosts
                            .map((post) => {
                                const hero = (post as BlogPost & { imageUrl?: string }).images?.[0] || (post as BlogPost & { imageUrl?: string }).imageUrl;
                                return (
                                    <div key={post.id} className="group w-full flex flex-col h-full bg-card border rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative">
                                        <Link href={`/blog/${post.id}`} className="flex-1 flex flex-col">
                                            {/* Image Container */}
                                            {hero ? (
                                                <div className="relative h-64 w-full overflow-hidden border-b">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={hero}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                                                </div>
                                            ) : (
                                                <div className="relative h-64 w-full bg-muted flex items-center justify-center border-b">
                                                    <Globe2 className="w-12 h-12 text-muted-foreground/20" />
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="p-8 flex flex-col flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                    <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 uppercase tracking-widest rounded-sm truncate max-w-[70%]">
                                                        {post.category || 'Science'}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest shrink-0">
                                                        <Clock size={12} /> {new Date(post.postedAt || post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-4 leading-tight tracking-tight">
                                                    {post.title}
                                                </h3>

                                                <p className="text-muted-foreground text-[0.9rem] mb-8 line-clamp-3 leading-relaxed flex-1">
                                                    {post.excerpt}
                                                </p>

                                                <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                                            <User size={12} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{post.author}</span>
                                                    </div>
                                                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                        Access File <ArrowRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )
                            })}
                    </div>
                )}
            </section>

            <Footer />
        </main>
    );
}
