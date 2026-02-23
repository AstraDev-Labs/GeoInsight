'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';
import { motion } from 'framer-motion';
import { Tag, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-500">
            <div className="w-full bg-background border-b z-20 relative">
                <Navbar />
            </div>

            <section className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
                <header className="mb-20">
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Tag size={16} />
                        Intelligence Taxonomy
                    </div>
                    <h1 className="text-[3.5rem] md:text-[5rem] font-black tracking-tighter text-foreground mb-8 leading-[0.95]">
                        Research Vectors
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-medium">
                        Navigate through the comprehensive classification of Remote Sensing and GIS research domains.
                        Each category represents a high-priority vector of Earth observation intelligence.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors], index) => (
                        <motion.div
                            key={group}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-card border p-10 rounded-2xl hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />

                            <h2 className="text-2xl font-black mb-8 text-foreground flex items-center justify-between tracking-tight">
                                {group}
                                <ChevronRight className="text-muted-foreground/40 group-hover:text-primary transition-all transform group-hover:translate-x-1" />
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {vectors.map((vector) => (
                                    <Link
                                        key={vector}
                                        href={`/?category=${encodeURIComponent(vector)}`}
                                        className="inline-block px-4 py-2 bg-muted/30 border rounded-lg text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all uppercase tracking-widest"
                                    >
                                        {vector}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 p-16 bg-card border rounded-[2.5rem] text-foreground relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left">
                            <h2 className="text-[2.5rem] font-black mb-6 tracking-tight leading-[1.1]">Contribute to Global Intelligence</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-medium">
                                Join the mission to map our planet's future. Submit your satellite findings, environmental analysis, and geospatial datasets to the board.
                            </p>
                        </div>
                        <Link
                            href="/request-post"
                            className="px-10 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-sm rounded-xl transition-all shadow-xl hover:shadow-primary/40 whitespace-nowrap"
                        >
                            Log Intelligence Report
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
