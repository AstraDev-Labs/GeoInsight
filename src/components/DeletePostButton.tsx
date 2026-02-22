"use client";

import { useState, useEffect } from 'react';
import { Trash2, X, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if current user is an admin
        fetch('/api/admin/verify')
            .then(res => { if (res.ok) setIsAdmin(true); })
            .catch(() => { });
    }, []);

    const handleDelete = async () => {
        if (!isAdmin && (!email.trim() || !password.trim())) {
            setError('Please enter your author email and deletion password.');
            return;
        }

        setDeleting(true);
        setError('');

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: isAdmin ? undefined : JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Could not delete. Email may not match.');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setDeleting(false);
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
                    padding: '0.7rem 1.2rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius)',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                }}
            >
                <Trash2 size={16} /> Delete This Post
            </button>

            {showModal && (
                <>
                    <div
                        onClick={() => setShowModal(false)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000
                        }}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        padding: '2rem',
                        maxWidth: '420px',
                        width: '90%',
                        zIndex: 1001
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#ef4444', margin: 0 }}>Delete Post</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: 'hsl(var(--foreground))', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Are you sure you want to delete <strong>&quot;{postTitle}&quot;</strong>?
                        </p>

                        {isAdmin ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0.75rem 1rem',
                                background: 'rgba(56, 189, 248, 0.08)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                borderRadius: 'var(--radius)',
                                marginBottom: '1rem',
                                fontSize: '0.85rem'
                            }}>
                                <Shield size={16} color="hsl(var(--primary))" />
                                <span>Deleting as <strong style={{ color: 'hsl(var(--primary))' }}>Admin</strong> — no email verification needed.</span>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginBottom: '1rem' }}>
                                    To confirm you are the author, enter the secure credentials you used when submitting this post.
                                </p>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your author email"
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem 1rem',
                                        background: 'hsl(var(--input))',
                                        border: error ? '1px solid #ef4444' : '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)',
                                        color: 'hsl(var(--foreground))',
                                        fontSize: '0.9rem',
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
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        marginBottom: '0.5rem',
                                        outline: 'none'
                                    }}
                                />
                            </>
                        )}

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
                                {error}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: deleting ? 'wait' : 'pointer',
                                    fontFamily: 'inherit',
                                    opacity: deleting ? 0.7 : 1
                                }}
                            >
                                {deleting ? 'Deleting...' : 'Confirm Delete'}
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
                </>
            )}
        </>
    );
}
