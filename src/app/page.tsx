'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, User, ArrowRight, Activity, Map, Globe2, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/mock-api';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { BlogPost } from '@/lib/types';
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';
import { ShieldAlert, X as CloseIcon } from 'lucide-react';

function HomeContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAlert, setShowAlert] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    api.getPosts().then(publishedPosts => {
      setPosts(publishedPosts);
    });

    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }

    if (searchParams.get('auth_error') === 'invalid_access') {
      setShowAlert(true);
      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col bg-white text-slate-900 transition-colors duration-500">
      <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
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
                onClick={() => setShowAlert(false)}
                className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto pb-24 pt-8 w-full">
        {/* Main Header */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <h1 className="text-[3rem] md:text-[4rem] font-bold tracking-tight mb-4 text-[#222] leading-[1.1]">
            GIS Blog Posts
          </h1>
          <p className="text-xl text-slate-600 font-light leading-relaxed max-w-3xl">
            This is a collaborative intelligence space for remote sensing peers.
          </p>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
            <span className="w-6 h-1 bg-[#0ea5e9] rounded-full" />
            Latest Publications
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search research, area of interest, or satellite..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] transition-all"
              />
            </div>
            {/* Category Filter */}
            <div className="relative w-full sm:w-64 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 z-10" />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#0ea5e9] focus:ring-1 focus:ring-[#0ea5e9] appearance-none cursor-pointer transition-all font-medium"
              >
                <option value="All">All Categories</option>
                {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                  <optgroup key={group} label={group} className="text-slate-500 font-semibold bg-white">
                    {vectors.map((v: string) => (
                      <option key={v} value={v} className="text-slate-900 font-normal">{v}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="w-full text-center py-24 px-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <p className="text-xl font-medium text-slate-700 mb-3">No research findings published yet.</p>
            <p className="text-slate-500">Be the first to share your data by requesting a post!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts
              .filter(post => {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                  post.title.toLowerCase().includes(query) ||
                  post.excerpt.toLowerCase().includes(query) ||
                  (post.areaOfInterest && post.areaOfInterest.toLowerCase().includes(query)) ||
                  (post.satellite && post.satellite.toLowerCase().includes(query));

                const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
                return matchesSearch && matchesCategory;
              })
              .map((post, i) => (
                <div key={post.id} className="group w-full flex flex-col h-full bg-white rounded-none">
                  <Link href={`/blog/${post.id}`} className="flex-1 flex flex-col hover:no-underline">
                    {/* Image Container */}
                    {post.images && post.images.length > 0 ? (
                      <div className="relative h-56 w-full mb-4 overflow-hidden border border-slate-200">
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="relative h-56 w-full mb-4 bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Map className="w-12 h-12 text-slate-300" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0ea5e9] mb-2">
                        {post.category}
                      </div>

                      <h3 className="text-xl font-bold mb-3 leading-snug text-slate-900 group-hover:text-[#0ea5e9] transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 text-[0.95rem] mb-6 line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="text-xs font-medium text-slate-500 pt-4 border-t border-slate-200 mt-auto flex items-center justify-between">
                        <span className="truncate max-w-[150px] uppercase tracking-wider">{post.author}</span>
                        <span className="uppercase tracking-wider">
                          {post.postedAt ? new Date(post.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : post.date}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    }>
      <HomeContent />
    </Suspense>
  );
}
