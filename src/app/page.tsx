'use client';

import Navbar from '@/components/Navbar';
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

    if (searchParams.get('auth_error') === 'invalid_access') {
      setShowAlert(true);
      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      <Navbar />

      {/* Floating Auth Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 100, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed left-1/2 z-[100] w-[90%] max-w-md"
          >
            <div className="bg-destructive/10 backdrop-blur-xl border border-destructive/20 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Security Intelligence Alert</p>
                <p className="text-xs text-destructive/80">Invalid access attempt detected. Session denied.</p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="p-1 text-muted-foreground hover:text-white transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abstract Animated Background Gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8 backdrop-blur-md">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="tracking-wide text-xs uppercase">Live Remote Sensing Data</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Unveiling Our Planet Through <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-glass-shimmer block mt-2">
              Advanced GIS Analysis
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            A collaborative intelligence space for the Remote Sensing team to share spatial findings,
            environmental insights, and next-generation GIS research.
          </p>

          <Link href="/request-post">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-[0_0_40px_-10px_rgba(56,189,248,0.7)] transition-all overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span>Contribute Findings</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-10 md:right-32 top-32 text-white/5 disabled"
        >
          <Globe2 className="w-24 h-24 text-secondary/40 blur-[2px]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-10 md:left-24 bottom-32 text-white/5 disabled"
        >
          <Map className="w-32 h-32 text-primary/30 blur-[4px]" />
        </motion.div>
      </section>

      <section className="relative z-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-8 h-1 bg-primary rounded-full" />
            Latest Publications
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search research..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            {/* Category Filter */}
            <div className="relative w-full sm:w-56 flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer transition-colors"
              >
                <option value="All" className="bg-popover text-white">All Categories</option>
                {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                  <optgroup key={group} label={group} className="bg-popover text-white/50">
                    {vectors.map((v: string) => (
                      <option key={v} value={v} className="bg-popover text-white">{v}</option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other" className="bg-popover text-white">Other</option>
              </select>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center py-20 px-8 border border-dashed border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm"
          >
            <p className="text-2xl font-medium text-foreground mb-4">No research findings published yet.</p>
            <p className="text-muted-foreground">Be the first to share your data by requesting a post!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts
              .filter(post => {
                const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
                return matchesSearch && matchesCategory;
              })
              .map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group w-full"
                >
                  <div className="flex flex-col h-full border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-primary/20 transition-all relative">
                    <Link href={`/blog/${post.id}`} className="absolute inset-0 z-10">
                      <span className="sr-only">Read {post.title}</span>
                    </Link>

                    {/* Image Container with Parallax Zoom */}
                    {post.images && post.images.length > 0 ? (
                      <div className="relative h-60 overflow-hidden">
                        <motion.img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                          {post.category}
                        </div>

                        {post.images.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/60 text-white backdrop-blur-md text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                            📷 +{post.images.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center border-b border-white/5">
                        <div className="absolute top-4 left-4 bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                          {post.category}
                        </div>
                        <Map className="w-16 h-16 text-white/30" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-xs font-medium text-white/60 pt-6 border-t border-white/10 mt-auto relative z-20">
                        <Link href={`/author/${encodeURIComponent(post.author)}`} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-full z-20 relative pointer-events-auto">
                          <User size={14} className="text-primary" />
                          <span className="truncate max-w-[120px] text-primary hover:underline">{post.author}</span>
                        </Link>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-secondary" />
                          {post.postedAt ? new Date(post.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : post.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-12 text-center text-muted-foreground mt-auto">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/privacy" className="text-xs text-white/40 hover:text-primary transition-colors">Privacy Policy</Link>
          <span className="text-white/10">|</span>
          <Link href="/support" className="text-xs text-white/40 hover:text-primary transition-colors">Support</Link>
          <span className="text-white/10">|</span>
          <Link href="/request-post" className="text-xs text-white/40 hover:text-primary transition-colors">Submit Research</Link>
        </div>
        <p className="font-medium text-sm">
          © {new Date().getFullYear()} Remote Sensing & GIS Intelligence. Built with Next.js, Framer Motion & AWS.
        </p>
      </footer>
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
