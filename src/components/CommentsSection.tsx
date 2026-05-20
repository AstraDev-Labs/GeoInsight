'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCallback } from 'react';
import { MessageSquare, Reply, Shield, Trash2, EyeOff, Eye } from 'lucide-react';
import type { PostComment } from '@/lib/types';

type Props = {
    postId: string;
};

type SessionState = {
    authenticated: boolean;
    role: 'user' | 'bot' | 'admin' | null;
    name: string | null;
};

type AuthMode = 'signin' | 'signup' | 'verify';

const INITIAL_SESSION: SessionState = {
    authenticated: false,
    role: null,
    name: null,
};

export default function CommentsSection({ postId }: Props) {
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyTarget, setReplyTarget] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState('');

    const [session, setSession] = useState<SessionState>(INITIAL_SESSION);

    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [signinIdentifier, setSigninIdentifier] = useState('');
    const [signinPassword, setSigninPassword] = useState('');

    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const [verificationCode, setVerificationCode] = useState('');
    const [pendingVerification, setPendingVerification] = useState<{ name: string; email: string } | null>(null);

    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [authMessage, setAuthMessage] = useState('');

    const fetchSession = useCallback(async () => {
        const res = await fetch('/api/comments/auth/session', { cache: 'no-store' });
        if (!res.ok) {
            setSession(INITIAL_SESSION);
            return;
        }

        const data = await res.json() as SessionState;
        setSession({
            authenticated: Boolean(data.authenticated),
            role: data.role,
            name: data.name,
        });
    }, []);

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json() as PostComment[];
            setComments(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        void (async () => {
            await fetchSession();
            await fetchComments();
        })();
    }, [fetchComments, fetchSession]);

    const isUser = session.authenticated && session.role === 'user';
    const canModerate = session.authenticated && (session.role === 'bot' || session.role === 'admin');

    const threadByParent = useMemo(() => {
        const map = new Map<string, PostComment[]>();
        const ROOT_KEY = '__root__';

        for (const comment of comments) {
            const key = comment.parentId || ROOT_KEY;
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)?.push(comment);
        }

        return map;
    }, [comments]);

    const submitComment = async (parentId?: string) => {
        const content = message.trim();
        if (!isUser || !content) return;

        setSubmitError('');
        setSubmitting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    parentId,
                }),
            });

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                setSubmitError(data.error || 'Failed to submit comment');
                return;
            }
            setMessage('');
            setReplyTarget(null);
            await fetchComments();
        } finally {
            setSubmitting(false);
        }
    };

    const moderateComment = async (commentId: string, status: 'visible' | 'hidden') => {
        if (!canModerate) return;

        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId, status }),
        });

        if (res.ok) {
            await fetchComments();
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!canModerate) return;

        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId }),
        });

        if (res.ok) {
            await fetchComments();
        }
    };

    const signin = async () => {
        setAuthLoading(true);
        setAuthError('');
        setAuthMessage('');

        try {
            const res = await fetch('/api/comments/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: signinIdentifier,
                    password: signinPassword,
                }),
            });

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                setAuthError(data.error || 'Failed to sign in');
                return;
            }

            setSigninPassword('');
            await fetchSession();
            await fetchComments();
        } finally {
            setAuthLoading(false);
        }
    };

    const signup = async () => {
        setAuthLoading(true);
        setAuthError('');
        setAuthMessage('');

        try {
            const res = await fetch('/api/comments/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupName,
                    email: signupEmail,
                    password: signupPassword,
                }),
            });

            const data = await res.json() as { error?: string; message?: string };
            if (!res.ok) {
                setAuthError(data.error || 'Failed to sign up');
                return;
            }

            setPendingVerification({ name: signupName.trim(), email: signupEmail.trim().toLowerCase() });
            setSignupPassword('');
            setAuthMode('verify');
            setAuthMessage(data.message || 'Verification code sent to your email.');
        } finally {
            setAuthLoading(false);
        }
    };

    const verifyEmail = async () => {
        const targetName = (pendingVerification?.name || signupName).trim();
        const targetEmail = (pendingVerification?.email || signupEmail).trim().toLowerCase();
        if (!targetName || !targetEmail) {
            setAuthError('Name and email are required for verification');
            return;
        }

        setAuthLoading(true);
        setAuthError('');
        setAuthMessage('');

        try {
            const res = await fetch('/api/comments/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: targetName,
                    email: targetEmail,
                    code: verificationCode,
                }),
            });

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                setAuthError(data.error || 'Failed to verify email');
                return;
            }

            setVerificationCode('');
            setAuthMode('signin');
            setSigninIdentifier(targetEmail);
            setPendingVerification(null);
            setAuthMessage('Email verified. You can now sign in.');
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = async () => {
        await fetch('/api/comments/auth/logout', { method: 'POST' });
        setSession(INITIAL_SESSION);
        setReplyTarget(null);
        await fetchComments();
    };

    return (
        <section className="mt-20 pt-12 border-t">
            <h3 className="text-foreground font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-3 mb-8">
                <MessageSquare size={16} className="text-primary" /> Discussion Thread
            </h3>

            <div className="bg-card border rounded-2xl p-6 mb-8 space-y-5">
                {session.authenticated ? (
                    <div className="flex items-center justify-between gap-4 text-sm">
                        <div className="text-muted-foreground">
                            Signed in as <span className="font-bold text-foreground">{session.name}</span> ({session.role})
                        </div>
                        <button
                            onClick={() => void logout()}
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                            Sign out
                        </button>
                    </div>
                ) : (
                    <div className="rounded-2xl border bg-background/60 p-4 md:p-5 space-y-4">
                        <div className="grid grid-cols-3 gap-2 max-w-md">
                            <button
                                onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthMessage(''); }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${authMode === 'signin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthMessage(''); }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${authMode === 'signup' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                            >
                                Sign up
                            </button>
                            <button
                                onClick={() => { setAuthMode('verify'); setAuthError(''); setAuthMessage(''); }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${authMode === 'verify' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                            >
                                Verify
                            </button>
                        </div>

                        {authMode === 'signin' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={signinIdentifier}
                                    onChange={(event) => setSigninIdentifier(event.target.value)}
                                    placeholder="Username or email"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50 md:col-span-2"
                                />
                                <input
                                    type="password"
                                    value={signinPassword}
                                    onChange={(event) => setSigninPassword(event.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={() => void signin()}
                                    disabled={authLoading || !signinIdentifier.trim() || !signinPassword.trim()}
                                    className="md:col-span-3 bg-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    {authLoading ? 'Signing in...' : 'Sign in'}
                                </button>
                            </div>
                        )}

                        {authMode === 'signup' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={signupName}
                                    onChange={(event) => setSignupName(event.target.value)}
                                    placeholder="Display name"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <input
                                    type="email"
                                    value={signupEmail}
                                    onChange={(event) => setSignupEmail(event.target.value)}
                                    placeholder="Email"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <input
                                    type="password"
                                    value={signupPassword}
                                    onChange={(event) => setSignupPassword(event.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={() => void signup()}
                                    disabled={authLoading || !signupName.trim() || !signupEmail.trim() || !signupPassword.trim()}
                                    className="md:col-span-3 bg-secondary text-secondary-foreground rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    {authLoading ? 'Creating account...' : 'Create account'}
                                </button>
                            </div>
                        )}

                        {authMode === 'verify' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    value={pendingVerification?.name || signupName}
                                    onChange={(event) => setSignupName(event.target.value)}
                                    placeholder="Display name"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <input
                                    type="email"
                                    value={pendingVerification?.email || signupEmail}
                                    onChange={(event) => setSignupEmail(event.target.value)}
                                    placeholder="Email"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(event) => setVerificationCode(event.target.value)}
                                    placeholder="Verification code"
                                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={() => void verifyEmail()}
                                    disabled={authLoading || !verificationCode.trim() || !(pendingVerification?.name || signupName).trim() || !(pendingVerification?.email || signupEmail).trim()}
                                    className="md:col-span-3 bg-accent text-accent-foreground rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                                >
                                    {authLoading ? 'Verifying...' : 'Verify email'}
                                </button>
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                            Sign in supports username or email. Verification code is only for signup activation.
                        </div>
                        {authMessage && <div className="text-xs text-secondary">{authMessage}</div>}
                        {authError && <div className="text-xs text-destructive">{authError}</div>}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-1">
                    <div className="text-sm text-muted-foreground">
                        {isUser ? 'You can now post comments and replies.' : 'Sign in as a user to post comments.'}
                    </div>
                    <button
                        onClick={() => void submitComment(replyTarget || undefined)}
                        disabled={submitting || !isUser || !message.trim()}
                        className="bg-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                        {replyTarget ? 'Post Reply' : 'Post Comment'}
                    </button>
                </div>

                <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={replyTarget ? 'Write your reply...' : 'Share your thoughts...'}
                    className="w-full bg-background border rounded-xl px-4 py-3 text-sm min-h-[110px] outline-none focus:border-primary/50"
                />
                {replyTarget && (
                    <button
                        onClick={() => setReplyTarget(null)}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                        Cancel reply mode
                    </button>
                )}
                {submitError && (
                    <div className="text-xs text-destructive">{submitError}</div>
                )}
            </div>

            {loading ? (
                <div className="text-sm text-muted-foreground">Loading comments...</div>
            ) : (threadByParent.get('__root__') || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No comments yet. Start the discussion.</div>
            ) : (
                <div className="space-y-6">
                    {(threadByParent.get('__root__') || []).map((comment) => {
                        const renderComment = (node: PostComment, depth: number): React.ReactNode => {
                            const children = threadByParent.get(node.id) || [];
                            const leftPad = Math.min(depth * 16, 64);

                            return (
                                <div key={node.id} style={{ marginLeft: leftPad }}>
                                    <div className={`bg-card border rounded-2xl p-5 ${node.status === 'hidden' ? 'opacity-70' : ''}`}>
                                        <div className="flex items-center justify-between mb-2 gap-2">
                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                {node.authorName}
                                                {node.status === 'hidden' && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                                        <Shield size={10} /> Hidden
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(node.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{node.message}</p>

                                        <div className="mt-3 flex items-center gap-3">
                                            <button
                                                onClick={() => setReplyTarget(node.id)}
                                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80"
                                            >
                                                <Reply size={12} /> Reply
                                            </button>

                                            {canModerate && (
                                                <>
                                                    <button
                                                        onClick={() => void moderateComment(node.id, node.status === 'hidden' ? 'visible' : 'hidden')}
                                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 hover:text-amber-500"
                                                    >
                                                        {node.status === 'hidden' ? <Eye size={12} /> : <EyeOff size={12} />}
                                                        {node.status === 'hidden' ? 'Unhide' : 'Hide'}
                                                    </button>
                                                    <button
                                                        onClick={() => void deleteComment(node.id)}
                                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive hover:text-destructive/80"
                                                    >
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {children.length > 0 && (
                                        <div className="mt-3 space-y-3 border-l pl-3">
                                            {children.map((child) => renderComment(child, depth + 1))}
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        return renderComment(comment, 0);
                    })}
                </div>
            )}
        </section>
    );
}
