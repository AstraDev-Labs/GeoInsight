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
                        background: '#111111',
                        border: '1px solid #333333',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        maxWidth: '450px',
                        width: '90%',
                        zIndex: 1001,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#ff4d4d', margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Delete Research</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'background 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p style={{ color: '#cccccc', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to permanently remove <strong style={{ color: 'white' }}>&quot;{postTitle}&quot;</strong> from the intelligence database?
                        </p>

                        {isAdmin ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '1rem 1.25rem',
                                background: 'rgba(14, 165, 233, 0.1)',
                                border: '1px solid rgba(14, 165, 233, 0.2)',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                                fontSize: '0.9rem',
                                color: '#bae6fd'
                            }}>
                                <Shield size={18} color="#0ea5e9" />
                                <span>Deleting as <strong style={{ color: '#0ea5e9', fontWeight: 700 }}>Admin</strong> — system override active, no verification required.</span>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                    Please verify your authorization to delete this research finding.
                                </p>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Author Email"
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem 1.25rem',
                                        background: '#1a1a1a',
                                        border: error ? '1px solid #ff4d4d' : '1px solid #333',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        marginBottom: '0.85rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = error ? '#ff4d4d' : '#333'}
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Author Deletion Password"
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem 1.25rem',
                                        background: '#1a1a1a',
                                        border: error ? '1px solid #ff4d4d' : '1px solid #333',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        marginBottom: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#0ea5e9'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = error ? '#ff4d4d' : '#333'}
                                />
                            </>
                        )}

                        {error && (
                            <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ff4d4d' }} />
                                {error}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    flex: 2,
                                    padding: '1rem',
                                    background: '#ff4d4d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: deleting ? 'wait' : 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(255, 77, 77, 0.2)'
                                }}
                                onMouseOver={(e) => !deleting && (e.currentTarget.style.background = '#ff3333')}
                                onMouseOut={(e) => !deleting && (e.currentTarget.style.background = '#ff4d4d')}
                            >
                                {deleting ? 'Processing...' : 'Confirm Deletion'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: '#222',
                                    color: '#aaa',
                                    border: '1px solid #333',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#aaa'; }}
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
