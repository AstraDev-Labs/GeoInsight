'use client';

import { useState } from 'react';
import { Edit3, Shield, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/language-context';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function EditPostButton({ post }: { post: any }) {
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(post.title || '');
    const [abstract, setAbstract] = useState(post.excerpt || ''); // Changed from .abstract to .excerpt
    const [content, setContent] = useState(post.content || '');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const router = useRouter();

    const handleSave = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please enter your author email and deletion password to confirm edits.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, excerpt: abstract, content, email, password, status: 'pending' })
            });

            const data = await res.json();

            if (res.ok) {
                setShowModal(false);
                router.refresh();
            } else {
                setError(data.error || 'Failed to update post');
            }
        } catch (err) {
            setError('Network error occurred while updating the post.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-muted border text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] hover:bg-muted/80 hover:text-primary transition-all rounded-xl w-full"
            >
                <Edit3 size={16} className="text-primary" /> {t('refineMission')}
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-md z-[2000] flex items-center justify-center p-4 lg:p-8"
                    onClick={() => setShowModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-card border p-8 lg:p-12 w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl relative rounded-[2rem] font-sans pr-12"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-8 right-8 text-muted-foreground/40 hover:text-foreground transition-colors p-2"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                            <Edit3 size={14} /> Intelligence Modification
                        </div>

                        <h2 className="text-[2.5rem] font-black mb-4 text-foreground tracking-tighter leading-none">
                            {t('refineMission')}
                        </h2>

                        <p className="text-muted-foreground/60 text-sm font-bold uppercase tracking-widest mb-10">
                            Update findings. Secure verification required for data mutability.
                        </p>

                        <div className="flex flex-col gap-8 mb-12">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{t('missionDesignation')}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-6 py-4 bg-muted/30 border focus:border-primary/50 text-foreground outline-none rounded-xl font-bold text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Data Abstract</label>
                                <textarea
                                    value={abstract}
                                    onChange={e => setAbstract(e.target.value)}
                                    className="w-full px-6 py-4 bg-muted/30 border text-muted-foreground outline-none focus:border-primary/50 rounded-xl min-h-[120px] resize-y text-sm font-medium leading-relaxed"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{t('missionLogs')}</label>
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder={t('analysisPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="bg-muted/30 border p-8 rounded-2xl mb-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                <Shield size={18} className="text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">{t('encryptionProtocols')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('fullName')}
                                    className={`w-full px-6 py-4 bg-background border ${error ? 'border-destructive/50' : 'border-border'} text-foreground outline-none focus:border-primary/50 rounded-xl text-xs font-bold transition-all uppercase tracking-widest`}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('setSecretKey')}
                                    className={`w-full px-6 py-4 bg-background border ${error ? 'border-destructive/50' : 'border-border'} text-foreground outline-none focus:border-primary/50 rounded-xl text-xs font-bold transition-all uppercase tracking-widest`}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <X size={14} /> {error}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-6 mt-8 pt-10 border-t">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-8 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.3em] text-xs rounded-xl transition-all shadow-xl hover:shadow-primary/40 disabled:opacity-50"
                            >
                                {saving ? t('committing') : t('commitChanges')}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-10 py-5 bg-muted text-muted-foreground border hover:text-foreground hover:bg-muted/80 font-black uppercase tracking-[0.3em] text-xs rounded-xl transition-all"
                            >
                                {t('abort')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
