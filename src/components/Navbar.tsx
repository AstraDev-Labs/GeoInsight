'use client';
import React from 'react';
import Link from 'next/link';
import { PlusCircle, LayoutDashboard, Home, Tag } from 'lucide-react';
export default function Navbar() {
    return (
        <nav className="w-full bg-[#0a0a0a] border-b border-white/5 shadow-sm flex items-center justify-between px-6 lg:px-12 py-4">
            <Link href="/" className="flex items-center gap-3 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="GeoForesight Logo" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                <span className="text-white font-semibold text-xl tracking-tight">
                    GeoForesights
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/" icon={<Home size={16} />} label="Home" />
                <NavLink href="/categories" icon={<Tag size={16} />} label="Categories" />
                <NavLink href="/request-post" icon={<PlusCircle size={16} />} label="Submit Report" />
                <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label="Admin Portal" />
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href="/request-post"
                    className="hidden md:flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
                >
                    Submit Research
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

