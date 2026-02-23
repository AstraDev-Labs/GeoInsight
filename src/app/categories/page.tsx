'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';
import { motion } from 'framer-motion';
import { Tag, ChevronRight, Globe } from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
    return (
        <main className="min-h-screen flex flex-col bg-[#0a0a0a] text-white font-sans">
            <div className="w-full bg-[#111111] border-b border-[#222222] z-20 relative">
                <Navbar />
            </div>

            <section className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
                <header className="mb-20">
                    <div className="flex items-center gap-3 text-[#0ea5e9] font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Tag size={16} />
                        Intelligence Taxonomy
                    </div>
                    <h1 className="text-[3.5rem] md:text-[5rem] font-black tracking-tighter text-white mb-8 leading-[0.95]">
                        Research Vectors
                    </h1>
                    <p className="text-xl text-[#888888] max-w-3xl leading-relaxed font-medium">
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
                            className="bg-[#111111] border border-[#222222] p-10 rounded-2xl hover:border-[#0ea5e9]/30 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#0ea5e9]/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#0ea5e9]/10 transition-colors" />

                            <h2 className="text-2xl font-black mb-8 text-white flex items-center justify-between tracking-tight">
                                {group}
                                <ChevronRight className="text-[#444] group-hover:text-[#0ea5e9] transition-all transform group-hover:translate-x-1" />
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {vectors.map((vector) => (
                                    <Link
                                        key={vector}
                                        href={`/?category=${encodeURIComponent(vector)}`}
                                        className="inline-block px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-xs font-bold text-[#666] hover:bg-[#0ea5e9] hover:text-white hover:border-[#0ea5e9] transition-all uppercase tracking-widest"
                                    >
                                        {vector}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 p-16 bg-[#111111] border border-[#222222] rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#0ea5e9]/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-[#0ea5e9]/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left">
                            <h2 className="text-[2.5rem] font-black mb-6 tracking-tight leading-[1.1]">Contribute to Global Intelligence</h2>
                            <p className="text-[#888] text-lg max-w-2xl leading-relaxed font-medium">
                                Join the mission to map our planet's future. Submit your satellite findings, environmental analysis, and geospatial datasets to the board.
                            </p>
                        </div>
                        <Link
                            href="/request-post"
                            className="px-10 py-5 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl transition-all shadow-xl hover:shadow-[#0ea5e9]/40 whitespace-nowrap"
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
