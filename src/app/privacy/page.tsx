import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | GeoForesight',
    description: 'Privacy Policy for the GeoForesight Remote Sensing & GIS Intelligence platform. Learn how we collect, use, and protect your data.',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-black font-sans relative">
            <div className="bg-[#1a1a1a] shadow-md z-20 relative w-full">
                <Navbar />
            </div>



            <article className="pt-36 pb-16 px-6 md:px-12 max-w-4xl mx-auto relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-[#006699]/10 rounded-full flex items-center justify-center border border-[#006699]/20">
                        <Shield className="text-[#006699]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-[#555] text-sm mt-1">Last updated: March 2026</p>
                    </div>
                </div>

                <div className="prose  prose-lg max-w-none prose-headings:text-[#222] prose-headings:font-serif prose-p:text-[#444] prose-strong:text-[#111] prose-a:text-[#006699]">
                    <h2>1. Information We Collect</h2>
                    <p>
                        When you submit a research post or interact with GeoForesight, we may collect the following information:
                    </p>
                    <ul>
                        <li><strong>Personal Information:</strong> Name, email address, and any other details you voluntarily provide when submitting content.</li>
                        <li><strong>Content Data:</strong> Research posts, images, documents, and attachments you upload to the platform.</li>
                        <li><strong>Usage Data:</strong> Anonymous analytics data including page views, browser type, and device information.</li>
                        <li><strong>Authentication Data:</strong> Hashed passwords used for author verification (never stored in plain text).</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>Your information is used exclusively for the following purposes:</p>
                    <ul>
                        <li>Publishing and displaying your submitted research content on the platform.</li>
                        <li>Sending email notifications about the status of your submissions (approved, declined, etc.).</li>
                        <li>Verifying your identity when you request to edit or delete your own posts.</li>
                        <li>Improving the platform experience and functionality.</li>
                    </ul>

                    <h2>3. Data Storage & Security</h2>
                    <p>
                        We take the security of your data seriously. All data is stored securely using industry-standard practices:
                    </p>
                    <ul>
                        <li>Passwords are hashed using <strong>bcrypt</strong> and never stored in plain text.</li>
                        <li>Files and images are stored on <strong>Cloudflare R2</strong> with encryption at rest.</li>
                        <li>Database records are stored on <strong>Cloudflare D1</strong> with access controls.</li>
                        <li>All connections to the platform are encrypted via <strong>HTTPS/TLS</strong>.</li>
                    </ul>

                    <h2>4. Third-Party Services</h2>
                    <p>We use the following third-party services:</p>
                    <ul>
                        <li><strong>Cloudflare:</strong> Performance optimization, storage (R2), and relational database (D1).</li>
                        <li><strong>Vercel:</strong> Application hosting and deployment.</li>
                        <li><strong>Google/Bing:</strong> Search engine indexing for discoverability.</li>
                        <li><strong>Email Services:</strong> Secure notification delivery.</li>
                    </ul>

                    <h2>5. Your Rights</h2>
                    <p>As a user of GeoForesight, you have the right to:</p>
                    <ul>
                        <li><strong>Access</strong> your personal data that we hold.</li>
                        <li><strong>Edit</strong> your published content using your author credentials.</li>
                        <li><strong>Delete</strong> your published content by verifying your identity.</li>
                        <li><strong>Request</strong> complete removal of your account data by contacting us.</li>
                    </ul>

                    <h2>6. Cookies</h2>
                    <p>
                        GeoForesight uses minimal cookies strictly necessary for authentication (admin session tokens).
                        We do not use tracking cookies, advertising cookies, or any third-party analytics cookies.
                    </p>

                    <h2>7. Data Retention</h2>
                    <p>
                        Published posts remain on the platform until deleted by the author or an administrator.
                        Declined submissions are retained in the admin logs for audit purposes and can be cleared by administrators.
                        Email addresses are retained only as long as necessary for the purposes described above.
                    </p>

                    <h2>8. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Any changes will be reflected on this page
                        with an updated revision date. Continued use of the platform after changes constitutes acceptance
                        of the updated policy.
                    </p>

                    <h2>9. Contact Us</h2>
                    <p>
                        If you have any questions or concerns about this Privacy Policy or your data, please reach out to us
                        through our <Link href="/support">Support page</Link>.
                    </p>
                </div>
            </article>

            <Footer />
        </main>
    );
}

