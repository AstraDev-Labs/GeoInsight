import Link from 'next/link';
import { Globe, PlusCircle, LayoutDashboard, Home, Tag } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="w-full bg-[#1a1a1a] shadow-md flex items-center justify-between px-6 lg:px-12 py-4">
            <Link href="/" className="flex items-center gap-3 group">
                <Globe className="text-[#0ea5e9] transition-transform duration-300 group-hover:rotate-180 w-6 h-6" />
                <span className="text-white font-semibold text-xl tracking-tight">
                    GeoInsights
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/" icon={<Home size={16} />} label="HOME" />
                <NavLink href="/categories" icon={<Tag size={16} />} label="CATEGORIES" />
                <NavLink href="/request-post" icon={<PlusCircle size={16} />} label="SUBMIT REPORT" />
                <NavLink href="/admin" icon={<LayoutDashboard size={16} />} label="ADMIN" />
            </div>

            <Link
                href="/request-post"
                className="hidden md:flex items-center justify-center px-6 py-2 bg-[#0ea5e9] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#0284c7] transition-colors"
            >
                Submit Data Finding
            </Link>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors"
        >
            {icon} {label}
        </Link>
    );
}
