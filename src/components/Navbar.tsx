import Link from 'next/link';
import { Globe, PlusCircle, LayoutDashboard, Home } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 mx-4 mt-4 lg:mx-auto max-w-7xl rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all">
            <Link href="/" className="flex items-center gap-2 group">
                <Globe className="text-primary transition-transform duration-300 group-hover:rotate-180" />
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-glass-shimmer font-bold text-xl tracking-tight">
                    GeoInsights
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <NavLink href="/" icon={<Home size={18} />} label="Home" />
                <NavLink href="/request-post" icon={<PlusCircle size={18} />} label="Request Post" />
                <NavLink href="/admin" icon={<LayoutDashboard size={18} />} label="Admin" />
            </div>

            <Link
                href="/request-post"
                className="hidden md:flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] hover:-translate-y-0.5"
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
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:scale-105"
        >
            {icon} {label}
        </Link>
    );
}
