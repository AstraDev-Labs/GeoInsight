'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Globe, PlusCircle, LayoutDashboard, Home, Tag, Languages, Search, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/lib/language-context';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { language, setLanguage, t } = useLanguage();

    return (
        <nav className="w-full bg-[#0a0a0a] border-b border-white/5 shadow-sm flex items-center justify-between px-6 lg:px-12 py-4">
            <Link href="/" className="flex items-center gap-3 group">
                <Globe className="text-primary transition-transform duration-300 group-hover:rotate-180 w-6 h-6" />
                <span className="text-white font-semibold text-xl tracking-tight">
                    GeoInsights
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/" icon={<Home size={16} />} label={t('home')} />
                <NavLink href="/categories" icon={<Tag size={16} />} label={t('categories')} />
                <NavLink href="/request-post" icon={<PlusCircle size={16} />} label={t('submitReport')} />
                <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label={t('adminPortal')} />
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />

                <Link
                    href="/request-post"
                    className="hidden md:flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
                >
                    {t('submitResearch')}
                </Link>
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
        >
            {icon} {label}
        </Link>
    );
}

function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

    const filteredLanguages = SUPPORTED_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 hover:bg-white/10 transition-all group"
            >
                <Languages size={14} className="text-white/40 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{activeLanguage.native}</span>
                <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
                    >
                        <div className="p-3 border-b border-white/5">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={t('searchLanguage')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {filteredLanguages.length > 0 ? (
                                filteredLanguages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-all text-left ${language === lang.code ? 'bg-primary/10' : ''
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white leading-none mb-1">{lang.native}</span>
                                            <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{lang.name}</span>
                                        </div>
                                        {language === lang.code && <Check size={14} className="text-primary" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <span className="text-xs text-white/20 font-medium">{t('noLanguages')}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
