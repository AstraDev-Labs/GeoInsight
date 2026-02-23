import Link from 'next/link';
import { Globe, PlusCircle, LayoutDashboard, Home, Tag, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function Navbar() {
    const { language, setLanguage } = useLanguage();

    return (
        <nav className="w-full bg-[#0a0a0a] border-b border-white/5 shadow-sm flex items-center justify-between px-6 lg:px-12 py-4">
            <Link href="/" className="flex items-center gap-3 group">
                <Globe className="text-primary transition-transform duration-300 group-hover:rotate-180 w-6 h-6" />
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

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Languages size={14} className="text-white/40" />
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-white/80"
                    >
                        <option value="en" className="bg-[#0a0a0a]">English</option>
                        <option value="es" className="bg-[#0a0a0a]">Español</option>
                        <option value="fr" className="bg-[#0a0a0a]">Français</option>
                        <option value="de" className="bg-[#0a0a0a]">Deutsch</option>
                        <option value="ar" className="bg-[#0a0a0a]">العربية</option>
                    </select>
                </div>

                <Link
                    href="/request-post"
                    className="hidden md:flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
                >
                    Submit Data Finding
                </Link>
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
        >
            {icon} {label}
        </Link>
    );
}
