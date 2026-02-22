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
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.6rem 1.2rem',
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                }}
            >
                <Edit3 size={16} /> Edit Post
            </button>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }} onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
                    <div style={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '1000px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        position: 'relative'
                    }} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'hsl(var(--muted-foreground))',
                                cursor: 'pointer',
                                padding: '0.5rem'
                            }}
                        >
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>
                            Edit Published Transmission
                        </h2>

                        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Update your research findings below. You must verify your identity to save changes.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'hsl(var(--input))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'hsl(var(--foreground))',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Abstract / Summary</label>
                                <textarea
                                    value={abstract}
                                    onChange={e => setAbstract(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'hsl(var(--input))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'hsl(var(--foreground))',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        minHeight: '80px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--foreground))' }}>Full Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'hsl(var(--input))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'hsl(var(--foreground))',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        minHeight: '400px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(56, 189, 248, 0.05)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                            borderRadius: 'var(--radius)',
                            padding: '1.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                                <Shield size={18} color="hsl(var(--primary))" />
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Verify Identity</h3>
                            </div>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your original author email"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    background: 'hsl(var(--input))',
                                    border: error ? '1px solid #ef4444' : '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    color: 'hsl(var(--foreground))',
                                    fontFamily: 'inherit',
                                    marginBottom: '0.75rem',
                                    outline: 'none'
                                }}
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Author Deletion Password"
                                style={{
                                    width: '100%',
                                    padding: '0.8rem 1rem',
                                    background: 'hsl(var(--input))',
                                    border: error ? '1px solid #ef4444' : '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    color: 'hsl(var(--foreground))',
                                    fontFamily: 'inherit',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                                {error}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'hsl(var(--primary))',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: saving ? 'wait' : 'pointer',
                                    fontFamily: 'inherit',
                                    opacity: saving ? 0.7 : 1
                                }}
                            >
                                {saving ? 'Submitting...' : 'Request Edit Approval'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: '0.8rem 1.2rem',
                                    background: 'hsl(var(--muted))',
                                    color: 'hsl(var(--foreground))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit'
                                }}
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
