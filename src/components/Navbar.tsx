import Link from 'next/link';
import { Globe, PlusCircle, LayoutDashboard, Home, Tag } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="w-full bg-background border-b shadow-sm flex items-center justify-between px-6 lg:px-12 py-4">
            <Link href="/" className="flex items-center gap-3 group">
                <Globe className="text-primary transition-transform duration-300 group-hover:rotate-180 w-6 h-6" />
                <span className="text-foreground font-semibold text-xl tracking-tight">
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
                className="hidden md:flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
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
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
            {icon} {label}
        </Link>
    );
}
