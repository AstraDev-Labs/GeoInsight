import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, FileText, Scale, Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | GeoInsights',
    description: 'Terms of Service for the GeoInsights Research Platform. Guidelines for research contribution, intellectual property, and data privacy.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsPage() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
            <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                <Navbar />
            </div>

            <section className="flex-1 max-w-4xl mx-auto px-6 py-20 w-full">
                <header className="mb-16 border-b border-slate-100 pb-12">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">
                        Last Updated: February 23, 2026
                    </p>
                </header>

                <div className="space-y-12 prose prose-slate max-w-none">
                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-6">
                            <Scale className="text-[#0ea5e9]" />
                            1. Agreement to Terms
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing or using the GeoInsights Research Platform ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you are prohibited from using the Platform. These terms govern the contribution of data, peer-review processes, and the consumption of Earth observation intelligence provided by GeoInsights.
                        </p>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-6">
                            <FileText className="text-[#0ea5e9]" />
                            2. Research Contribution Guidelines
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Contributors are responsible for the accuracy and integrity of the data provided. Submissions must adhere to scientific standards and should include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Verified methodology for data extraction and analysis.</li>
                            <li>Clear citation of satellite sources (e.g., Sentinel-2, Landsat 8-9).</li>
                            <li>Proper attribution of secondary datasets.</li>
                            <li>Avoidance of sensitive or classified geopolitical intelligence that violates local or international laws.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-6">
                            <Shield className="text-[#0ea5e9]" />
                            3. Intellectual Property
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Unless otherwise stated, all research published on GeoInsights is provided under an Open Access framework. However, the Platform retains the right to host and distribute the content. Authors maintain the right to their original findings but grant GeoInsights a perpetual, royalty-free license to display and archive the submission globally.
                        </p>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-6">
                            <Lock className="text-[#0ea5e9]" />
                            4. Data Privacy & Security
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Peer reviewers and system administrators may view unreleased intelligence during the validation phase. Reviewers are bound by confidentiality to ensure that findings are not leaked or used for personal gain prior to official publication. Unauthorized access to the Admin Terminal or the Research Vector database is strictly prohibited.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-8 border border-slate-200 bg-slate-50 rounded-2xl">
                    <p className="text-center text-slate-500 text-sm italic">
                        Questions regarding these terms should be directed to the GeoInsights Board via the Support Center.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
