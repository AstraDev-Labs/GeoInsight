import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

export default function Footer() {
    const { t, isRTL } = useLanguage();

    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-white/5 text-white/90 pt-16 pb-8 mt-auto font-sans">
            <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

                {/* Brand Area */}
                <div className="flex flex-col gap-4 max-w-sm">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <Globe className="text-primary w-10 h-10 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-white font-bold text-2xl tracking-tight leading-tight">
                            GeoInsights
                        </span>
                    </Link>
                    <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                        {t('footerDesc')}
                    </p>
                    <Link href="/request-post" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold uppercase tracking-widest mt-4">
                        {t('submitResearch')} <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                </div>

                {/* Links Area */}
                <div className="flex gap-16 md:gap-24">
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">{t('platform')}</span>
                        <Link href="/" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('home')}</Link>
                        <Link href="/categories" className="text-white/50 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                            {t('categories')} <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">{t('new')}</span>
                        </Link>
                        <Link href="/request-post" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('submitReport')}</Link>
                        <Link href="/admin" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('adminPortal')}</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold uppercase tracking-widest text-xs mb-2">{t('legal')}</span>
                        <Link href="/privacy" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('privacyPolicy')}</Link>
                        <Link href="/terms" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('termsOfService')}</Link>
                        <Link href="/support" className="text-white/50 hover:text-white transition-colors text-sm font-medium">{t('support')}</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 mb-8">
                    <p className="text-white/40 text-xs font-medium uppercase tracking-widest">
                        © {new Date().getFullYear()} Remote Sensing & GIS Intelligence
                    </p>
                    <div className="flex gap-6 text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
                        {t('builtForEO')}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-12 gap-y-3 text-[13px] text-white/60">
                    <div className="flex gap-2">
                        <span className="text-white/30 font-medium">{t('lastUpdated')}:</span>
                        <span className="text-white/80 font-bold">Feb 23, 2026</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-white/30 font-medium">{t('pageEditor')}:</span>
                        <span className="text-white/80 font-bold">Tharun G</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-white/30 font-medium">{t('responsibleOfficial')}:</span>
                        <span className="text-white/80 font-bold">{t('intelligenceBoard')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
