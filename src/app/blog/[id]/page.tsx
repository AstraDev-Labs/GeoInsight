import Navbar from '@/components/Navbar';
import DeletePostButton from '@/components/DeletePostButton';
import EditPostButton from '@/components/EditPostButton';
import { dataService } from '@/lib/data-service';
import { Calendar, User, ArrowLeft, Tag, Clock, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const posts = await dataService.getPosts();
    const post = posts.find(p => p.id === id);

    if (!post || post.status !== 'published') {
        notFound();
    }

    const postedDate = post.postedAt ? new Date(post.postedAt) : new Date(post.date);

    return (
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <article style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--primary)',
                    marginBottom: '2rem',
                    fontWeight: 600
                }}>
                    <ArrowLeft size={18} /> Back to Insights
                </Link>

                {post.images && post.images.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{
                            fontSize: '0.85rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--muted-foreground)',
                            marginBottom: '1rem'
                        }}>
                            📷 All Evidence Photos ({post.images.length})
                        </h4>
                        <a href={post.images[0]} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    height: '450px',
                                    objectFit: 'cover',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    transition: 'filter 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                className="hover:brightness-110 transition-all duration-300"
                            />
                        </a>
                        {post.images.length > 1 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: '1rem',
                                }}>
                                    {post.images.slice(1).map((img, i) => (
                                        <a href={img} target="_blank" rel="noopener noreferrer" key={i} style={{ position: 'relative', display: 'block' }}>
                                            <img
                                                src={img}
                                                alt={`${post.title} evidence ${i + 2}`}
                                                style={{
                                                    width: '100%',
                                                    height: '180px',
                                                    objectFit: 'cover',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                                className="hover:scale-[1.02] hover:brightness-110 transition-all duration-200"
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                left: '8px',
                                                background: 'rgba(0,0,0,0.6)',
                                                backdropFilter: 'blur(4px)',
                                                color: 'white',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontWeight: 600
                                            }}>
                                                Photo {i + 2}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
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

                <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '2rem', letterSpacing: '-0.02em' }}>
                    {post.title}
                </h1>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '2rem',
                    color: 'var(--muted-foreground)',
                    marginBottom: '3.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid var(--border)'
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

                <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary">
                    {post.content && post.content.trim().startsWith('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content || "Full findings are being finalized by the administration team."}
                        </ReactMarkdown>
                    )}
                </div>

                {post.attachments && post.attachments.length > 0 && (
                    <div style={{
                        marginTop: '4rem',
                        padding: '2rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)'
                    }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <FileText size={20} /> Research Proofs & Documents
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {post.attachments.map((att, i) => (
                                <a
                                    key={i}
                                    href={att}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-link"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '0.8rem 1.2rem',
                                        background: 'rgba(56, 189, 248, 0.05)',
                                        border: '1px solid rgba(56, 189, 248, 0.2)',
                                        borderRadius: 'var(--radius)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <ExternalLink size={16} color="var(--primary)" />
                                    Document {i + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Author Delete */}
                <div style={{
                    marginTop: '4rem',
                    padding: '1.5rem',
                    background: 'rgba(239, 68, 68, 0.03)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Author Controls</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>If you are the author, you can request deletion of this post.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <EditPostButton post={post} />
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                </div>
            </article>

            <footer style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
                marginTop: 'auto',
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--muted-foreground)',
                fontSize: '0.9rem'
            }}>
                © 2024 Remote Sensing & GIS Team. Data Integrity & Scientific Excellence.
            </footer>
        </main>
    );
}
