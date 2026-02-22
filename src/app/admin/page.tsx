'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/mock-api';
import { PostRequest, BlogPost } from '@/lib/types';
import { Calendar, Check, X, LogOut, FileText, Image, Paperclip, Lock, Shield, Settings, Trash2, ChevronLeft, ChevronRight, Activity, Globe, LayoutDashboard, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    // Auth state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);

    // Data state
    const [requests, setRequests] = useState<PostRequest[]>([]);
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [activeTab, setActiveTab] = useState<'requests' | 'posts' | 'live' | 'logs'>('requests');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;
    const [loading, setLoading] = useState(true);

    // Publishing state
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishingPost, setPublishingPost] = useState<BlogPost | null>(null);
    const [formContent, setFormContent] = useState('');
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
    const [publishing, setPublishing] = useState(false);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/admin/verify');
            if (res.ok) {
                setIsAuthenticated(true);
                fetchData();
            }
        } catch {
            // Not authenticated
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoggingIn(true);
        setAuthError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (data.success) {
                setIsAuthenticated(true);
                setPassword('');
                fetchData();
            } else {
                setAuthError('Invalid password. Access denied.');
            }
        } catch {
            setAuthError('Connection error. Please try again.');
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        setIsAuthenticated(false);
        setRequests([]);
        setAllPosts([]);
    };

    const fetchData = async () => {
        const [reqs, posts] = await Promise.all([
            api.getRequests(),
            api.getAllPosts()
        ]);
        setRequests(reqs);
        setAllPosts(posts);
        setLoading(false);
    };

    const handleAction = async (id: string, status: 'accepted' | 'denied') => {
        await api.updateRequestStatus(id, status);
        fetchData();
    };

    const handleDeleteRequest = async (id: string, title: string) => {
        if (confirm(`Delete request "${title}"? This cannot be undone.`)) {
            await api.deleteRequest(id);
            fetchData();
        }
    };

    const handleClearHistory = async () => {
        if (confirm('Are you sure you want to clear all history? This will permanently delete all completed requests and rejected publications. Published posts will remain.')) {
            try {
                const res = await api.clearHistory();
                if (res.error) {
                    alert('Failed to clear history: ' + res.error);
                } else {
                    fetchData();
                }
            } catch (err) {
                alert('Connection error while clearing history.');
            }
        }
    };

    const startPublishing = (post: BlogPost) => {
        setPublishingPost(post);
        setFormContent(post.content || '');
        setExistingImages(post.images || []);
        setExistingAttachments(post.attachments || []);
        setIsPublishing(true);
    };

    const handlePublish = async () => {
        if (!publishingPost) return;
        setPublishing(true);

        try {
            await api.publishPost(
                publishingPost.id,
                formContent,
                existingImages,
                existingAttachments
            );

            // Send email notification (non-blocking)
            if (publishingPost.authorEmail) {
                fetch('/api/admin/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'published',
                        authorEmail: publishingPost.authorEmail,
                        authorName: publishingPost.author,
                        postTitle: publishingPost.title,
                        postId: publishingPost.id,
                    })
                }).catch(err => console.error('Notification failed:', err));
            }

            setIsPublishing(false);
            setPublishingPost(null);
            fetchData();
        } catch (err) {
            console.error('Publish error:', err);
            alert('Error publishing. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    const handleDecline = async () => {
        if (!publishingPost) return;
        setPublishing(true);

        try {
            const res = await api.updatePostStatus(publishingPost.id, 'rejected');

            if (res.error) {
                alert('Failed to decline: ' + res.error);
                return;
            }

            // Send email notification (non-blocking)
            if (publishingPost.authorEmail) {
                fetch('/api/admin/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'declined',
                        authorEmail: publishingPost.authorEmail,
                        authorName: publishingPost.author,
                        postTitle: publishingPost.title,
                    })
                }).catch(err => console.error('Notification failed:', err));
            }

            setIsPublishing(false);
            setPublishingPost(null);
            fetchData();
        } catch (err) {
            console.error('Decline error:', err);
            alert('Error declining submission. Please try again.');
        } finally {
            setPublishing(false);
        }
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Navbar />
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-background relative flex items-center justify-center">
                <Navbar />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card max-w-md w-full p-10 mx-4 text-center z-10"
                >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                        <Shield className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Admin Terminal</h1>
                    <p className="text-muted-foreground mb-8 text-sm">Enter the secure master key to access the intelligence dashboard.</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter master key..."
                                required
                                autoComplete="current-password"
                                className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white rounded-xl px-12 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {authError && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm font-semibold">
                                {authError}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loggingIn}
                            className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] disabled:opacity-50"
                        >
                            {loggingIn ? 'Authenticating...' : 'Unlock Dashboard'}
                        </button>
                    </form>
                </motion.div>
            </main>
        );
    }

    if (loading) return (
        <main className="min-h-screen bg-background relative py-28 px-4 sm:px-10">
            <Navbar />
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        </main>
    );

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const pendingPosts = allPosts.filter(p => p.status === 'pending');
    const historyRequests = requests.filter(r => r.status !== 'pending');

    const historyItems = [
        ...historyRequests.map(r => ({ id: r.id, title: r.title, author: r.author, status: r.status, type: 'Request', date: r.submittedAt || '' })),
        ...allPosts.filter(p => p.status === 'rejected').map(p => ({ id: p.id, title: p.title, author: p.author, status: p.status, type: 'Post', date: p.postedAt || p.date || '' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const liveFindings = allPosts.filter(p => p.status === 'published').sort((a, b) => new Date(b.postedAt || b.date).getTime() - new Date(a.postedAt || a.date).getTime());


    const totalPublished = allPosts.filter(p => p.status === 'published').length;
    const totalPendingActions = pendingRequests.length + pendingPosts.length;
    const totalHistoryItems = historyItems.length;

    return (
        <main className="min-h-screen flex flex-col bg-background relative pt-28 pb-0 px-4 sm:px-10 lg:px-20">
            <Navbar />

            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Central Command</h1>
                        <p className="text-muted-foreground">Manage incoming research and publication requests.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive font-medium transition-all"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Published</p>
                            <h3 className="text-3xl font-bold text-white">{totalPublished}</h3>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Globe size={24} />
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Pending Actions</p>
                            <h3 className="text-3xl font-bold text-white">{totalPendingActions}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-l-secondary flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">System Logs</p>
                            <h3 className="text-3xl font-bold text-white">{totalHistoryItems}</h3>
                        </div>
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                            <LayoutDashboard size={24} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => { setActiveTab('requests'); setCurrentPage(1); }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'requests' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    >
                        Incoming Requests ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('posts'); setCurrentPage(1); }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'posts' ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    >
                        Content Review ({pendingPosts.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('live'); setCurrentPage(1); }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'live' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    >
                        Live Archive ({liveFindings.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('logs'); setCurrentPage(1); }}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'logs' ? 'bg-secondary text-primary-foreground shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'}`}
                    >
                        Action Audit ({historyItems.length})
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activeTab}
                    className="glass-card shadow-lg overflow-x-auto"
                >
                    {activeTab === 'live' ? (
                        <div className="p-5">
                            <h3 className="text-lg font-semibold text-white mb-4">Live Discovery Archive</h3>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-muted-foreground text-sm uppercase tracking-wider bg-black/20">
                                        <th className="p-4 font-semibold">Discovery Title</th>
                                        <th className="p-4 font-semibold">Author</th>
                                        <th className="p-4 font-semibold">Category</th>
                                        <th className="p-4 font-semibold">Active Since</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {liveFindings.length === 0 ? (
                                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No live content currently published.</td></tr>
                                    ) : (
                                        liveFindings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((post, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4 font-semibold text-white/90">{post.title}</td>
                                                <td className="p-4 text-white/70">{post.author}</td>
                                                <td className="p-4">
                                                    <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs leading-none">{post.category}</span>
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground">{new Date(post.postedAt || post.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : activeTab === 'logs' ? (
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">System Action Audit</h3>
                                <button
                                    onClick={handleClearHistory}
                                    className="px-4 py-2 bg-destructive/10 hover:bg-destructive/30 text-destructive text-sm font-semibold rounded-lg transition-colors border border-destructive/20 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Clear History
                                </button>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-muted-foreground text-sm uppercase tracking-wider bg-black/20">
                                        <th className="p-4 font-semibold">Type</th>
                                        <th className="p-4 font-semibold">Identifier</th>
                                        <th className="p-4 font-semibold">Title</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {historyItems.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No recent activity found.</td></tr>
                                    ) : (
                                        historyItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{item.type}</span></td>
                                                <td className="p-4 font-semibold text-white/90">{item.author}</td>
                                                <td className="p-4 text-sm text-white/80">{item.title}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'accepted' || item.status === 'published' ? 'text-secondary bg-secondary/10' : 'text-destructive bg-destructive/10'}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {historyItems.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/10">
                                    <span className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, historyItems.length)} of {historyItems.length} entries
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(historyItems.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(historyItems.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-muted-foreground text-sm uppercase tracking-wider bg-black/20">
                                        <th className="p-5 font-semibold">Author Profile</th>
                                        <th className="p-5 font-semibold">Transmission Title</th>
                                        <th className="p-5 font-semibold hidden md:table-cell">Classification</th>
                                        <th className="p-5 font-semibold hidden lg:table-cell">Timestamp</th>
                                        <th className="p-5 font-semibold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeTab === 'requests' ? (
                                        pendingRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                                                    No incoming requests detected in the system.
                                                </td>
                                            </tr>
                                        ) : (
                                            pendingRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(req => (
                                                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{req.author}</div>
                                                        <div className="text-xs text-muted-foreground">{req.email}</div>
                                                    </td>
                                                    <td className="p-5 font-medium">{req.title}</td>
                                                    <td className="p-5 hidden md:table-cell">
                                                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/5">{req.category}</span>
                                                    </td>
                                                    <td className="p-5 hidden lg:table-cell text-sm text-muted-foreground">
                                                        {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {req.status === 'pending' ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => handleAction(req.id, 'accepted')} className="p-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors border border-secondary/20" title="Accept Request">
                                                                    <Check size={18} />
                                                                </button>
                                                                <button onClick={() => handleAction(req.id, 'denied')} className="p-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors border border-destructive/20" title="Deny Request">
                                                                    <X size={18} />
                                                                </button>
                                                                <button onClick={() => handleDeleteRequest(req.id, req.title)} className="p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors ml-2" title="Purge Record">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${req.status === 'accepted' ? 'text-secondary bg-secondary/10 border border-secondary/20' : 'text-destructive bg-destructive/10 border border-destructive/20'}`}>
                                                                {req.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    ) : (
                                        pendingPosts.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                                                    No publications awaiting review.
                                                </td>
                                            </tr>
                                        ) : (
                                            pendingPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(post => (
                                                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="font-semibold text-white group-hover:text-primary transition-colors">{post.author}</div>
                                                    </td>
                                                    <td className="p-5 font-medium">{post.title}</td>
                                                    <td className="p-5 hidden md:table-cell">
                                                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium border border-white/5">{post.category}</span>
                                                    </td>
                                                    <td className="p-5 hidden lg:table-cell text-sm text-muted-foreground">
                                                        {post.date}
                                                    </td>
                                                    <td className="p-5 flex items-center justify-center">
                                                        {post.status === 'pending' ? (
                                                            <button onClick={() => startPublishing(post)} className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-medium transition-colors border border-primary/20 text-sm">
                                                                <FileText size={16} /> Review Data
                                                            </button>
                                                        ) : (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase text-secondary bg-secondary/10 border border-secondary/20">
                                                                {post.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                            {activeTab === 'requests' && pendingRequests.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/10">
                                    <span className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pendingRequests.length)} of {pendingRequests.length} entries
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(pendingRequests.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(pendingRequests.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'posts' && pendingPosts.length > ITEMS_PER_PAGE && (
                                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/10">
                                    <span className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pendingPosts.length)} of {pendingPosts.length} entries
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(pendingPosts.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(pendingPosts.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Content Review Modal */}
            <AnimatePresence>
                {isPublishing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !publishing && setIsPublishing(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative max-w-3xl w-full max-h-[90vh] glass-card overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence Review</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Evaluating: {publishingPost?.title}</p>
                                </div>
                                <button disabled={publishing} onClick={() => setIsPublishing(false)} className="p-2 text-muted-foreground hover:bg-white/10 hover:text-white rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                {/* Post Metadata */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Title</p>
                                        <p className="text-white font-semibold text-lg">{publishingPost?.title}</p>
                                    </div>
                                    <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Author</p>
                                        <p className="text-white font-semibold">{publishingPost?.author}</p>
                                    </div>
                                    <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Author Email</p>
                                        <p className="text-primary font-medium">{publishingPost?.authorEmail || <span className="text-muted-foreground italic">Not provided</span>}</p>
                                    </div>
                                    <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Category</p>
                                        <p className="text-secondary font-semibold">{publishingPost?.category}</p>
                                    </div>
                                </div>

                                {/* Abstract */}
                                {(publishingPost as any)?.abstract && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-3 flex items-center gap-2">
                                            📋 Abstract / Summary
                                        </h3>
                                        <div className="bg-black/50 border border-white/10 rounded-xl p-5 text-sm text-white/80 leading-relaxed">
                                            {(publishingPost as any).abstract}
                                        </div>
                                    </div>
                                )}

                                {/* Full Content */}
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-primary" /> Author&apos;s Full Briefing
                                    </h3>
                                    {formContent && formContent.trim().startsWith('<') ? (
                                        <div
                                            className="bg-black/50 border border-white/10 rounded-xl p-5 text-sm text-white/90 leading-relaxed max-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: formContent }}
                                        />
                                    ) : (
                                        <div className="bg-black/50 border border-white/10 rounded-xl p-5 text-sm text-white/90 whitespace-pre-wrap font-mono leading-relaxed max-h-[400px] overflow-y-auto">
                                            {formContent || <span className="text-muted-foreground italic">No briefing content provided.</span>}
                                        </div>
                                    )}
                                </div>

                                {existingImages.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-3 flex items-center gap-2">
                                            <ImagePlus size={16} className="text-primary" /> Attached Visuals ({existingImages.length})
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            {existingImages.map((url, i) => (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-white/10 bg-black/50">
                                                    <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded backdrop-blur-sm transition-opacity">View Full</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {existingAttachments.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-3 flex items-center gap-2">
                                            <Paperclip size={16} className="text-primary" /> Supporting Documents ({existingAttachments.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {existingAttachments.map((url, i) => (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-xl transition-colors group">
                                                    <FileText className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm text-white/90 truncate flex-1">{url.split('/').pop()}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-black/40 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] disabled:opacity-50 flex items-center justify-center gap-2 sm:col-span-2"
                                >
                                    {publishing ? 'Executing...' : <>✅ Approve & Publish</>}
                                </button>
                                <button
                                    onClick={handleDecline}
                                    disabled={publishing}
                                    className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-white border border-destructive/30 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {publishing ? 'Executing...' : <>❌ Decline</>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-12 text-center text-muted-foreground mt-auto -mx-4 sm:-mx-10 lg:-mx-20 mt-12">
                <p className="font-medium text-sm">
                    © {new Date().getFullYear()} Remote Sensing & GIS Intelligence. Built with Next.js, Framer Motion & AWS.
                </p>
            </footer>
        </main>
    );
}
