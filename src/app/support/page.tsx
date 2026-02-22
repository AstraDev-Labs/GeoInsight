'use client';

import Navbar from '@/components/Navbar';
import { LifeBuoy, Mail, MessageSquare, FileText, ExternalLink, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, wire this to an API endpoint or mailto
        const mailtoLink = `mailto:geoinsight.org@gmail.com?subject=Support Request from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(email)}`;
        window.open(mailtoLink);
        setSent(true);
    };

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground relative">
            <Navbar />

            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="pt-36 pb-16 px-6 md:px-12 max-w-5xl mx-auto relative z-10 flex-1 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-secondary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <LifeBuoy className="text-secondary" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Support Center</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Need help with your submission, account, or have a question? We&apos;re here to assist you.
                    </p>
                </motion.div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 text-center"
                    >
                        <FileText className="text-primary mx-auto mb-4" size={28} />
                        <h3 className="font-bold text-lg mb-2">Documentation</h3>
                        <p className="text-muted-foreground text-sm mb-4">Learn how to submit research, manage posts, and use the platform.</p>
                        <Link href="/privacy" className="text-primary text-sm font-medium hover:underline">
                            Read Privacy Policy →
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 text-center"
                    >
                        <Mail className="text-secondary mx-auto mb-4" size={28} />
                        <h3 className="font-bold text-lg mb-2">Email Us</h3>
                        <p className="text-muted-foreground text-sm mb-4">Reach out directly for urgent issues or detailed inquiries.</p>
                        <a href="mailto:geoinsight.org@gmail.com" className="text-secondary text-sm font-medium hover:underline">
                            geoinsight.org@gmail.com
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6 text-center"
                    >
                        <MessageSquare className="text-amber-400 mx-auto mb-4" size={28} />
                        <h3 className="font-bold text-lg mb-2">FAQs</h3>
                        <p className="text-muted-foreground text-sm mb-4">Find quick answers to the most commonly asked questions.</p>
                        <span className="text-amber-400 text-sm font-medium">See below ↓</span>
                    </motion.div>
                </div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-8 md:p-10 mb-16"
                >
                    <h2 className="text-2xl font-bold mb-2">Send a Message</h2>
                    <p className="text-muted-foreground text-sm mb-8">Fill out the form below and we&apos;ll get back to you within 24-48 hours.</p>

                    {sent ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary/20">
                                <span className="text-2xl font-bold text-secondary">✓</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Message Prepared!</h3>
                            <p className="text-muted-foreground text-sm">Your email client should have opened. If not, email us directly at geoinsight.org@gmail.com</p>
                            <button onClick={() => setSent(false)} className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors">
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/80">Your Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                        placeholder="John Smith"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-white/80">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white/80">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-y min-h-[150px]"
                                    placeholder="Describe your issue or question..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center gap-3 transition-all"
                            >
                                <Send size={20} /> Send Message
                            </button>
                        </form>
                    )}
                </motion.div>

                {/* FAQs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-6 h-1 bg-amber-400 rounded-full" />
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: 'How do I submit a research post?', a: 'Navigate to the "Request Post" page from the navigation bar. Fill in your research details, upload any images or documents, set a secure password, and submit. Your post will be reviewed by an administrator before publication.' },
                            { q: 'How long does the review process take?', a: 'Typically 24-48 hours. You will receive an email notification once your submission has been reviewed and either approved or declined.' },
                            { q: 'Can I edit my post after publication?', a: 'Yes! On your published post page, scroll to the "Author Controls" section. Enter your author email and password to request edits. Edited posts are re-submitted for admin approval.' },
                            { q: 'How do I delete my post?', a: 'On your published post page, use the "Delete This Post" button in the Author Controls section. You will need to verify your identity with your author credentials.' },
                            { q: 'What file formats are supported for uploads?', a: 'For images: JPG, PNG, GIF, WebP. For documents: PDF, DOC, DOCX, XLSX, CSV, ZIP, TXT. Maximum file sizes apply depending on the hosting configuration.' },
                            { q: 'Is my data secure?', a: 'Yes. Passwords are hashed with bcrypt, files are stored on encrypted AWS S3, and all connections use HTTPS. Read our full Privacy Policy for more details.' },
                        ].map((faq, i) => (
                            <div key={i} className="glass-card p-6">
                                <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-12 text-center text-muted-foreground mt-auto">
                <p className="font-medium text-sm">
                    © {new Date().getFullYear()} Remote Sensing & GIS Intelligence. Built with Next.js, Framer Motion & AWS.
                </p>
            </footer>
        </main>
    );
}
