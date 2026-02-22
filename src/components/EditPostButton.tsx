'use client';

import { useState } from 'react';
import { Edit3, Shield, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditPostButton({ post }: { post: any }) {
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(post.title || '');
    const [abstract, setAbstract] = useState(post.abstract || '');
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
                body: JSON.stringify({ title, abstract, content, email, password, status: 'pending' })
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
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#e5e5e5] text-[#222] font-semibold text-sm hover:bg-[#f9f9f9] transition-all font-sans w-full"
            >
                <Edit3 size={16} className="text-[#006699]" /> Edit Post
            </button>

            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
                    onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                >
                    <div
                        className="bg-white border border-[#e5e5e5] p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 text-[#888] hover:text-[#222] transition-colors p-1"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold mb-2 text-[#222] font-serif">
                            Edit Published Transmission
                        </h2>

                        <p className="text-[#666] text-sm mb-8">
                            Update your research findings below. You must verify your identity to save changes.
                        </p>

                        <div className="flex flex-col gap-5 mb-8">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#d5d5d5] text-[#222] outline-none focus:border-[#006699] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Abstract / Summary</label>
                                <textarea
                                    value={abstract}
                                    onChange={e => setAbstract(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#d5d5d5] text-[#222] outline-none focus:border-[#006699] transition-colors min-h-[100px] resize-y"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-[#555] mb-2">Full Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#f9f9f9] border border-[#d5d5d5] text-[#222] font-mono text-sm outline-none focus:border-[#006699] transition-colors min-h-[400px] resize-y leading-relaxed whitespace-pre-wrap"
                                    spellCheck={false}
                                />
                            </div>
                        </div>

                        <div className="bg-[#f4f4f4] border border-[#e5e5e5] p-6 mb-8 mt-8 border-l-4 border-l-[#006699]">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={18} className="text-[#006699]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#222]">Verify Identity</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Original Author Email"
                                    className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-[#d5d5d5]'} text-[#222] outline-none focus:border-[#006699] transition-colors placeholder-[#888]`}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Author Deletion Password"
                                    className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-500' : 'border-[#d5d5d5]'} text-[#222] outline-none focus:border-[#006699] transition-colors placeholder-[#888]`}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-600 text-sm mb-4 font-semibold">
                                {error}
                            </p>
                        )}

                        <div className="flex gap-4 mt-6 pt-6 border-t border-[#e5e5e5]">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-[#006699] text-white font-bold border-none text-md cursor-pointer disabled:opacity-70 disabled:cursor-wait hover:bg-[#004f7a] transition-colors"
                            >
                                {saving ? 'Submitting Edit...' : 'Request Edit Approval'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-white text-[#222] border border-[#d5d5d5] font-bold text-md cursor-pointer hover:bg-[#f0f0f0] transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
