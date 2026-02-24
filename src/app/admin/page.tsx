'use client';

import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/mock-api';
import { PostRequest, BlogPost } from '@/lib/types';
import { Check, X, LogOut, FileText, Paperclip, Lock, Shield, Trash2, ChevronLeft, ChevronRight, Activity, Globe, LayoutDashboard, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import AdminAnalyticsPanel from '@/components/AdminAnalyticsPanel';
// import BotSettingsPanel from '@/components/BotSettingsPanel';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

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

    const fetchData = useCallback(async () => {
        const [reqs, posts] = await Promise.all([
            api.getRequests(),
            api.getAllPosts()
        ]);
        setRequests(reqs);
        setAllPosts(posts);
        setLoading(false);
    }, []);

    const checkAuth = useCallback(async () => {
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
    }, [fetchData]);

    // Check auth on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

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
            } catch {
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
            <main className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#222] font-sans">
                <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                    <Navbar />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#006699]/30 border-t-primary rounded-full animate-spin" />
                </div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#222] font-sans">
                <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                    <Navbar />
                </div>

                <div className="flex-1 relative flex items-center justify-center p-4">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#006699]/20 rounded-full hidden pointer-events-none" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-[#e5e5e5] shadow-sm max-w-md w-full p-10 mx-4 text-center z-10"
                    >
                        <div className="w-20 h-20 rounded-full bg-[#006699]/10 flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Shield className="w-10 h-10 text-[#006699]" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#222]">Admin Terminal</h1>
                        <p className="text-[#666] mb-8 text-sm">Enter the secure master key to access the intelligence dashboard.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666] w-5 h-5" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter master key..."
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-[#f9f9f9] border border-[#e5e5e5] focus:border-[#006699]/50 text-[#222] rounded-xl px-12 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20"
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
                                className="w-full py-4 rounded-xl bg-[#006699] hover:bg-[#006699]/90 text-white font-bold transition-all shadow-sm hover:shadow-sm disabled:opacity-50"
                            >
                                {loggingIn ? 'Authenticating...' : 'Unlock Dashboard'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        );
    }

    if (loading) return (
        <main className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#222] font-sans">
            <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                <Navbar />
            </div>
            <div className="flex-1 flex justify-center items-center py-28 px-4 sm:px-10">
                <div className="w-8 h-8 border-4 border-[#006699]/30 border-t-primary rounded-full animate-spin" />
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
        <main className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#222] font-sans">
            <div className="w-full bg-[#1a1a1a] shadow-md z-20 relative">
                <Navbar />
            </div>

            <div className="flex-1 relative pb-20 pt-8 px-4 sm:px-10 lg:px-20 w-full overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#006699]/10 rounded-full hidden pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#222]">Central Command</h1>
                            <p className="text-[#666]">Manage incoming research and publication requests.</p>
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
                        <div className="bg-white border border-[#e5e5e5] shadow-sm p-6 rounded-2xl border-l-4 border-l-primary flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#666] font-medium uppercase tracking-wider mb-1">Total Published</p>
                                <h3 className="text-3xl font-bold text-[#222]">{totalPublished}</h3>
                            </div>
                            <div className="w-12 h-12 bg-[#006699]/10 rounded-full flex items-center justify-center text-[#006699]">
                                <Globe size={24} />
                            </div>
                        </div>
                        <div className="bg-white border border-[#e5e5e5] shadow-sm p-6 rounded-2xl border-l-4 border-l-amber-500 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#666] font-medium uppercase tracking-wider mb-1">Pending Actions</p>
                                <h3 className="text-3xl font-bold text-[#222]">{totalPendingActions}</h3>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                                <Activity size={24} />
                            </div>
                        </div>
                        <div className="bg-white border border-[#e5e5e5] shadow-sm p-6 rounded-2xl border-l-4 border-l-secondary flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#666] font-medium uppercase tracking-wider mb-1">System Logs</p>
                                <h3 className="text-3xl font-bold text-[#222]">{totalHistoryItems}</h3>
                            </div>
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                                <LayoutDashboard size={24} />
                            </div>
                        </div>
                    </div>

                    <AdminAnalyticsPanel posts={allPosts} requests={requests} />
                    {/* <BotSettingsPanel canEdit={isAuthenticated} /> */}

                    <div className="flex flex-wrap gap-4 mb-8">
                        <button
                            onClick={() => { setActiveTab('requests'); setCurrentPage(1); }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'requests' ? 'bg-[#006699] text-white shadow-sm' : 'bg-[#f9f9f9] text-[#666] hover:bg-[#f0f0f0] hover:text-[#222]'}`}
                        >
                            Incoming Requests ({pendingRequests.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('posts'); setCurrentPage(1); }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'posts' ? 'bg-[#006699] text-white shadow-sm' : 'bg-[#f9f9f9] text-[#666] hover:bg-[#f0f0f0] hover:text-[#222]'}`}
                        >
                            Content Review ({pendingPosts.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('live'); setCurrentPage(1); }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'live' ? 'bg-emerald-500 text-[#222] shadow-sm' : 'bg-[#f9f9f9] text-[#666] hover:bg-[#f0f0f0] hover:text-[#222]'}`}
                        >
                            Live Archive ({liveFindings.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('logs'); setCurrentPage(1); }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'logs' ? 'bg-[#1f2937] text-white shadow-sm border border-[#111827]' : 'bg-[#f9f9f9] text-[#666] hover:bg-[#f0f0f0] hover:text-[#222]'}`}
                        >
                            Action Audit ({historyItems.length})
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeTab}
                        className="bg-white border border-[#e5e5e5] shadow-sm shadow-lg overflow-x-auto"
                    >
                        {activeTab === 'live' ? (
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-[#222] mb-4">Live Discovery Archive</h3>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#e5e5e5] text-[#666] text-sm uppercase tracking-wider bg-[#eaeaea]">
                                            <th className="p-4 font-semibold">Discovery Title</th>
                                            <th className="p-4 font-semibold">Author</th>
                                            <th className="p-4 font-semibold">Category</th>
                                            <th className="p-4 font-semibold">Active Since</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {liveFindings.length === 0 ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-[#666]">No live content currently published.</td></tr>
                                        ) : (
                                            liveFindings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((post, idx) => (
                                                <tr key={idx} className="hover:bg-[#f9f9f9] transition-colors group">
                                                    <td className="p-4 font-semibold text-[#222]">{post.title}</td>
                                                    <td className="p-4 text-[#555]">{post.author}</td>
                                                    <td className="p-4">
                                                        <span className="bg-[#006699]/10 text-[#006699] border border-[#006699]/20 px-2 py-1 rounded text-xs leading-none">{post.category}</span>
                                                    </td>
                                                    <td className="p-4 text-xs text-[#666]">{new Date(post.postedAt || post.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : activeTab === 'logs' ? (
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-[#222]">System Action Audit</h3>
                                    <button
                                        onClick={handleClearHistory}
                                        className="px-4 py-2 bg-destructive/10 hover:bg-destructive/30 text-destructive text-sm font-semibold rounded-lg transition-colors border border-destructive/20 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Clear History
                                    </button>
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#e5e5e5] text-[#666] text-sm uppercase tracking-wider bg-[#eaeaea]">
                                            <th className="p-4 font-semibold">Type</th>
                                            <th className="p-4 font-semibold">Identifier</th>
                                            <th className="p-4 font-semibold">Title</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {historyItems.length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-[#666]">No recent activity found.</td></tr>
                                        ) : (
                                            historyItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item, idx) => (
                                                <tr key={idx} className="hover:bg-[#f9f9f9] transition-colors group">
                                                    <td className="p-4"><span className="bg-[#f0f0f0] px-2 py-1 rounded text-xs">{item.type}</span></td>
                                                    <td className="p-4 font-semibold text-[#222]">{item.author}</td>
                                                    <td className="p-4 text-sm text-[#444]">{item.title}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${item.status === 'accepted' || item.status === 'published' ? 'text-secondary bg-secondary/10' : 'text-destructive bg-destructive/10'}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-[#666]">{new Date(item.date).toLocaleDateString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                {historyItems.length > ITEMS_PER_PAGE && (
                                    <div className="p-4 border-t border-[#e5e5e5] flex justify-between items-center bg-[#f0f0f0]">
                                        <span className="text-xs text-[#666]">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, historyItems.length)} of {historyItems.length} entries
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(historyItems.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(historyItems.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-5">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#e5e5e5] text-[#666] text-sm uppercase tracking-wider bg-[#eaeaea]">
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
                                                    <td colSpan={5} className="p-10 text-center text-[#666]">
                                                        No incoming requests detected in the system.
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(req => (
                                                    <tr key={req.id} className="hover:bg-[#f9f9f9] transition-colors group">
                                                        <td className="p-5">
                                                            <div className="font-semibold text-[#222] group-hover:text-[#006699] transition-colors">{req.author}</div>
                                                            <div className="text-xs text-[#666]">{req.email}</div>
                                                        </td>
                                                        <td className="p-5 font-medium text-[#222]">{req.title}</td>
                                                        <td className="p-5 hidden md:table-cell">
                                                            <span className="bg-[#f0f0f0] px-3 py-1 rounded-full text-xs font-medium border border-[#e5e5e5]">{req.category}</span>
                                                        </td>
                                                        <td className="p-5 hidden lg:table-cell text-sm text-[#666]">
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
                                                                    <button onClick={() => handleDeleteRequest(req.id, req.title)} className="p-2 text-[#666] hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors ml-2" title="Purge Record">
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
                                                    <td colSpan={5} className="p-10 text-center text-[#666]">
                                                        No publications awaiting review.
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(post => (
                                                    <tr key={post.id} className="hover:bg-[#f9f9f9] transition-colors group">
                                                        <td className="p-5">
                                                            <div className="font-semibold text-[#222] group-hover:text-[#006699] transition-colors">{post.author}</div>
                                                        </td>
                                                        <td className="p-5 font-medium text-[#222]">{post.title}</td>
                                                        <td className="p-5 hidden md:table-cell">
                                                            <span className="bg-[#f0f0f0] px-3 py-1 rounded-full text-xs font-medium border border-[#e5e5e5]">{post.category}</span>
                                                        </td>
                                                        <td className="p-5 hidden lg:table-cell text-sm text-[#666]">
                                                            {post.date}
                                                        </td>
                                                        <td className="p-5 flex items-center justify-center">
                                                            {post.status === 'pending' ? (
                                                                <button onClick={() => startPublishing(post)} className="flex items-center gap-2 px-4 py-2 bg-[#006699]/10 hover:bg-[#006699]/20 text-[#006699] rounded-xl font-medium transition-colors border border-[#006699]/20 text-sm">
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
                                    <div className="p-4 border-t border-[#e5e5e5] flex justify-between items-center bg-[#f0f0f0]">
                                        <span className="text-xs text-[#666]">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pendingRequests.length)} of {pendingRequests.length} entries
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(pendingRequests.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(pendingRequests.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'posts' && pendingPosts.length > ITEMS_PER_PAGE && (
                                    <div className="p-4 border-t border-[#e5e5e5] flex justify-between items-center bg-[#f0f0f0]">
                                        <span className="text-xs text-[#666]">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pendingPosts.length)} of {pendingPosts.length} entries
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                                            <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(pendingPosts.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(pendingPosts.length / ITEMS_PER_PAGE)} className="p-1 rounded bg-[#f9f9f9] hover:bg-[#f0f0f0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
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
                                className="relative max-w-3xl w-full max-h-[90vh] bg-white border border-[#e5e5e5] shadow-sm overflow-hidden flex flex-col"
                            >
                                <div className="p-6 border-b border-[#e5e5e5] bg-[#f4f4f4] flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#222] tracking-tight">Intelligence Review</h2>
                                        <p className="text-sm text-[#666] mt-1">Evaluating: {publishingPost?.title}</p>
                                    </div>
                                    <button
                                        onClick={() => !publishing && setIsPublishing(false)}
                                        className="p-2 hover:bg-[#e5e5e5] rounded-full transition-colors text-[#888] hover:text-[#222]"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                                    {/* Post Metadata */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-[#666] mb-1">Title</p>
                                            <p className="text-[#222] font-semibold text-lg">{publishingPost?.title}</p>
                                        </div>
                                        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-[#666] mb-1">Author</p>
                                            <p className="text-[#222] font-semibold">{publishingPost?.author}</p>
                                        </div>
                                        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-[#666] mb-1">Author Email</p>
                                            <p className="text-[#006699] font-medium">{publishingPost?.authorEmail || <span className="text-[#666] italic">Not provided</span>}</p>
                                        </div>
                                        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-xl p-4">
                                            <p className="text-xs uppercase tracking-wider text-[#666] mb-1">Category</p>
                                            <p className="text-[#006699] font-semibold">{publishingPost?.category}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#444] mb-3 flex items-center gap-2">
                                            <FileText size={16} className="text-[#006699]" /> Document Analysis Content
                                        </h3>
                                        <RichTextEditor
                                            content={formContent}
                                            onChange={setFormContent}
                                            placeholder="Review and edit the full transmission text..."
                                        />
                                    </div>

                                    {existingImages.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#444] mb-3 flex items-center gap-2">
                                                <ImagePlus size={16} className="text-[#006699]" /> Attached Visuals ({existingImages.length})
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {existingImages.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-[#e5e5e5] bg-[#f9f9f9]">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-[#f4f4f4] transition-colors flex items-center justify-center">
                                                            <span className="opacity-0 group-hover:opacity-100 text-[#222] text-xs font-semibold px-2 py-1 bg-black/60 rounded backdrop-blur-sm transition-opacity">View Full</span>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {existingAttachments.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#444] mb-3 flex items-center gap-2">
                                                <Paperclip size={16} className="text-[#006699]" /> Supporting Documents ({existingAttachments.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {existingAttachments.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#f9f9f9] hover:bg-[#f0f0f0] border border-[#e5e5e5] px-4 py-3 rounded-xl transition-colors group">
                                                        <FileText className="w-4 h-4 text-[#006699] group-hover:scale-110 transition-transform" />
                                                        <span className="text-sm text-[#222] truncate flex-1">{url.split('/').pop()}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-[#e5e5e5] bg-[#f4f4f4] grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={handlePublish}
                                        disabled={publishing}
                                        className="bg-[#006699] hover:bg-[#006699]/90 text-white font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 sm:col-span-2"
                                    >
                                        {publishing ? 'Executing...' : <>✅ Approve & Publish</>}
                                    </button>
                                    <button
                                        onClick={handleDecline}
                                        disabled={publishing}
                                        className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-[#222] border border-destructive/30 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {publishing ? 'Executing...' : <>❌ Decline</>}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </main>
    );
}
