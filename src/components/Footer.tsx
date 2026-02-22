import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#111] text-white pt-16 pb-8 mt-auto font-sans">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

                {/* Brand Area */}
                <div className="flex flex-col gap-4 max-w-sm">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <Globe className="text-[#0ea5e9] w-10 h-10 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-white font-bold text-2xl tracking-tight leading-tight">
                            GeoInsights
                        </span>
                    </Link>
                    <p className="text-[#888] text-sm leading-relaxed mt-2">
                        A collaborative intelligence platform for remote sensing peers to explore, analyze, and share Earth observation findings.
                    </p>
                    <Link href="/request-post" className="flex items-center gap-2 text-[#0ea5e9] hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mt-4">
                        Submit Research <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Links Area */}
                <div className="flex gap-16 md:gap-24">
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">Platform</span>
                        <Link href="/" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Home</Link>
                        <Link href="/categories" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium flex items-center gap-2">Categories <span className="bg-[#0ea5e9]/20 text-[#0ea5e9] text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">New</span></Link>
                        <Link href="/request-post" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Submit Report</Link>
                        <Link href="/admin" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Admin Portal</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">Legal</span>
                        <Link href="/privacy" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Privacy Policy</Link>
                        <Link href="/terms" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Terms of Service</Link>
                        <Link href="/support" className="text-[#888] hover:text-[#0ea5e9] transition-colors text-sm font-medium">Support</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8 border-t border-[#222]">
                <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 mb-8">
                    <p className="text-[#666] text-xs font-medium uppercase tracking-widest">
                        © {new Date().getFullYear()} Remote Sensing & GIS Intelligence
                    </p>
                    <div className="flex gap-6 text-[10px] text-[#666] uppercase tracking-[0.2em] font-bold">
                        Built for Earth Observation
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-12 gap-y-3 text-[13px] text-[#888888]">
                    <div className="flex gap-2">
                        <span className="text-[#555] font-medium">Page Last Updated:</span>
                        <span className="text-white font-bold">Feb 23, 2026</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[#555] font-medium">Page Editor:</span>
                        <span className="text-white font-bold">Tharun G</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[#555] font-medium">Responsible Official for Science:</span>
                        <span className="text-white font-bold">GeoInsights Intelligence Board</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
