'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';
import { motion } from 'framer-motion';
import { Tag, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
    return (
        <main className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
            <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                <Navbar />
            </div>

            <section className="flex-1 max-w-7xl mx-auto px-6 py-20 w-full">
                <header className="mb-16">
                    <div className="flex items-center gap-3 text-[#0ea5e9] font-bold uppercase tracking-[0.2em] text-sm mb-4">
                        <Tag size={16} />
                        Intelligence Categories
                    </div>
                    <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-6">
                        Explore Research Vectors
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl leading-relaxed">
                        Navigate through our comprehensive taxonomy of Remote Sensing and GIS research areas.
                        Each category represents a distinct vector of Earth observation intelligence.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors], index) => (
                        <motion.div
                            key={group}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                        >
                            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center justify-between">
                                {group}
                                <ChevronRight className="text-slate-300 group-hover:text-[#0ea5e9] transition-colors" />
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {vectors.map((vector) => (
                                    <Link
                                        key={vector}
                                        href={`/?category=${encodeURIComponent(vector)}`}
                                        className="inline-block px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 hover:bg-[#0ea5e9] hover:text-white hover:border-[#0ea5e9] transition-all"
                                    >
                                        {vector}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 p-12 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Have new findings to contribute?</h2>
                            <p className="text-slate-400 text-lg max-w-xl">
                                Join the global network of Earth observation research peers. Submit your analysis and datasets to the GeoInsights mission.
                            </p>
                        </div>
                        <Link
                            href="/request-post"
                            className="px-8 py-4 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#0ea5e9]/20 whitespace-nowrap"
                        >
                            Submit Intelligence Report
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
