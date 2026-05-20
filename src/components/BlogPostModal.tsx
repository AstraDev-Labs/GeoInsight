'use client';

import { X, Calendar, User, Tag, Clock, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EditPostButton from '@/components/EditPostButton';
import DeletePostButton from '@/components/DeletePostButton';
import { BlogPost } from '@/lib/types';
import { useEffect } from 'react';

interface BlogPostModalProps {
    post: BlogPost;
    onClose: () => void;
}

export default function BlogPostModal({ post, onClose }: BlogPostModalProps) {
    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (post) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [post]);

    const postedDate = post.postedAt ? new Date(post.postedAt) : new Date(post.date);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }} className="animate-in fade-in duration-300" onClick={() => {
            onClose();
        }}>

            <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.5rem',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }} className="glass-card" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem 2rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: 'var(--primary)',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Tag size={12} /> {post.category}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        className="hover:bg-white/20 hover:text-red-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2.5rem' }}>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'white' }}>
                        {post.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '2.5rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={18} color="var(--primary)" />
                            <Link href={`/author/${encodeURIComponent(post.author)}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }} className="hover:underline">
                                {post.author}
                            </Link>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={18} />
                            {postedDate.toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={18} />
                            {postedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    {post.images && post.images.length > 0 && (() => {
                        const images = post.images;
                        return (
                            <div style={{ marginBottom: '3rem' }}>
                                <h4 style={{
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'rgba(255,255,255,0.5)',
                                    marginBottom: '1rem'
                                }}>
                                    📷 All Evidence Photos ({images.length})
                                </h4>
                                <div
                                    style={{ cursor: 'context-menu', position: 'relative', display: 'block' }}
                                    className="group"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={images[0]}
                                        alt={post.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '400px',
                                            objectFit: 'cover',
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        className="group-hover:brightness-110"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(56, 189, 248, 0.1)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        borderRadius: '1rem'
                                    }} className="group-hover:opacity-100">
                                        <div style={{
                                            background: 'rgba(15, 23, 42, 0.8)',
                                            padding: '0.75rem 1.25rem',
                                            borderRadius: '999px',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid rgba(56, 189, 248, 0.3)'
                                        }}>
                                            <ExternalLink size={14} color="var(--primary)" /> Right-click → Open image in new tab
                                        </div>
                                    </div>
                                </div>

                                {images.length > 1 && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                            gap: '1rem',
                                        }}>
                                            {images.slice(1).map((img, i) => (
                                                <div
                                                    key={i}
                                                    style={{ position: 'relative', cursor: 'context-menu', display: 'block' }}
                                                    className="group"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img}
                                                        alt={`${post.title} evidence ${i + 2}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '140px',
                                                            objectFit: 'cover',
                                                            borderRadius: '0.75rem',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                        className="group-hover:scale-105 group-hover:brightness-110"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center rounded-xl px-2 text-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] sm:text-xs font-semibold px-2 py-1 bg-black/80 rounded backdrop-blur-sm transition-opacity pointer-events-none">
                                                            Right-click → Open image in new tab
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-headings:text-white prose-strong:text-white prose-code:text-primary mb-12">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content || (post as { abstract?: string }).abstract || post.excerpt || "Full findings are being finalized by the administration team."}
                        </ReactMarkdown>
                    </div>

                    {post.attachments && post.attachments.length > 0 && (
                        <div style={{
                            marginBottom: '3rem',
                            padding: '1.5rem',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '1rem'
                        }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: 'var(--primary)' }}>
                                <FileText size={20} /> Research Proofs & Documents
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {post.attachments.map((att, i) => (
                                    <a
                                        key={i}
                                        href={att}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-primary/20 hover:border-primary/50 transition-colors"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '0.6rem 1rem',
                                            background: 'rgba(56, 189, 248, 0.05)',
                                            border: '1px solid rgba(56, 189, 248, 0.2)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        <ExternalLink size={16} color="var(--primary)" />
                                        Document {i + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Controls */}
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'white' }}>Author Controls</p>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Request edits or deletion of this post.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <EditPostButton post={post} />
                            <DeletePostButton postId={post.id} postTitle={post.title} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
