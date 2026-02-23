import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeletePostButton from '@/components/DeletePostButton';
import EditPostButton from '@/components/EditPostButton';
import { dataService } from '@/lib/data-service';
import { Calendar, User, ArrowLeft, Tag, Clock, FileText, ExternalLink, Activity } from 'lucide-react';
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
        <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 font-sans">
            <div className="bg-background border-b z-20 relative w-full">
                <Navbar />
            </div>

            <article className="flex-1 w-full bg-background pb-24">

                <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-[0.2em] mb-8 transition-all font-sans group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Research Terminal
                    </Link>
                </div>

                {/* NASA Style Main Image at Top */}
                <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center font-sans">
                    {post.images && post.images.length > 0 ? (
                        <div className="mb-8 w-full">
                            <a href={post.images[0]} target="_blank" rel="noopener noreferrer" className="block outline-none select-none relative group cursor-pointer bg-[#f9f9f9]">
                                <img
                                    src={post.images[0]}
                                    alt={post.title}
                                    className="w-full h-auto object-cover max-h-[700px] transition-transform duration-300 rounded-none shadow-sm"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                                    <span className="text-white text-sm flex items-center gap-2 font-bold tracking-widest uppercase">
                                        <ExternalLink size={16} /> View Full-Res
                                    </span>
                                </div>
                            </a>
                        </div>
                    ) : null}

                    {/* Title and Metadata below image */}
                    <div className="text-left w-full border-b pb-10">
                        <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] mb-8 text-foreground tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-col md:flex-row md:items-start gap-8 mt-6">
                            {/* Standard Metadata */}
                            <div className="flex flex-col gap-4 min-w-[200px]">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-[10px]">Date</span>
                                    <span className="font-bold text-foreground text-sm">
                                        {postedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-[10px]">Author</span>
                                    <Link href={`/author/${encodeURIComponent(post.author)}`} className="font-bold text-primary text-sm hover:text-primary/80 transition-colors">
                                        {post.author}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-[10px]">Domain</span>
                                    <span className="font-black text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 uppercase tracking-widest">
                                        {post.category || 'Earth Sciences'}
                                    </span>
                                </div>
                            </div>

                            {/* New Tags Metadata */}
                            {(post.satellite || post.areaOfInterest) && (
                                <div className="flex flex-col gap-4 min-w-[200px] border-l-0 md:border-l md:border-border md:pl-10">
                                    {post.areaOfInterest && (
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-[10px]">Location</span>
                                            <span className="font-bold text-foreground text-sm max-w-[250px] truncate" title={post.areaOfInterest}>
                                                {post.areaOfInterest}
                                            </span>
                                        </div>
                                    )}
                                    {post.satellite && (
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-[10px]">Sensor(s)</span>
                                            <span className="font-bold text-foreground text-sm max-w-[250px] truncate" title={post.satellite}>
                                                {post.satellite}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content & Sidebar Layout */}
                <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-start mt-8">

                    {/* Main Content Column */}
                    <div className="w-full lg:w-[68%]">

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none text-foreground/80 prose-p:leading-[1.8] prose-p:text-[1.1rem] prose-p:font-[400] prose-p:mb-8 prose-a:text-primary prose-a:font-bold hover:prose-a:text-primary/80 prose-headings:text-foreground prose-headings:font-black prose-headings:mt-12 prose-strong:text-foreground prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-6 prose-blockquote:text-muted-foreground prose-blockquote:italic prose-img:mt-10 prose-img:mb-6 prose-img:rounded-xl prose-img:border prose-img:border-border">
                            {post.content && post.content.trim().startsWith('<') ? (
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {post.content}
                                </ReactMarkdown>
                            )}
                        </div>

                        {/* Secondary Thumbnail Gallery */}
                        {post.images && post.images.length > 1 && (
                            <div className="mt-20 pt-12 border-t">
                                <h3 className="text-foreground font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-3 mb-8">
                                    <Activity size={16} className="text-primary" /> Additional Imagery
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {post.images.slice(1).map((img, i) => (
                                        <a href={img} target="_blank" rel="noopener noreferrer" key={i} className="relative block group bg-muted aspect-video overflow-hidden cursor-pointer rounded-xl border border-border hover:border-primary/50 transition-all shadow-lg hover:shadow-primary/10">
                                            <img
                                                src={img}
                                                alt={`${post.title} supplementary image ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] bg-primary px-4 py-2 rounded-lg shadow-lg">Enlarge Findings</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="w-full lg:w-[32%] sticky top-8">

                        {/* Download / References Box */}
                        <div className="bg-card border p-8 rounded-2xl mb-10 w-full">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-6 flex items-center gap-2">
                                <FileText size={16} className="text-primary" /> Datasets / Downloads
                            </h3>

                            {post.attachments && post.attachments.length > 0 ? (
                                <div className="space-y-4">
                                    {post.attachments.map((att, i) => (
                                        <a
                                            key={i}
                                            href={att}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col p-4 bg-muted/30 border border-border hover:border-primary transition-all rounded-xl shadow-sm hover:shadow-primary/5"
                                        >
                                            <span className="text-foreground font-bold text-[0.85rem] flex justify-between items-center break-all transition-colors group-hover:text-primary">
                                                Technical Document {i + 1}
                                                <ExternalLink size={14} className="text-muted-foreground/40 shrink-0 ml-2 group-hover:text-primary" />
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60 mt-2 break-all flex items-center gap-1 font-bold tracking-widest uppercase">
                                                <Tag size={10} /> {att.split('/').pop()?.substring(0, 30) || 'DATA_REF'}...
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground/60 bg-muted/10 p-6 border border-dashed rounded-xl italic text-center">No supplemental datasets provided.</p>
                            )}
                        </div>

                        {/* Author Controls */}
                        <div className="bg-card border border-destructive/10 p-8 rounded-2xl relative overflow-hidden group/sidebar">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full blur-2xl -mr-12 -mt-12" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-4 flex items-center gap-2">
                                Author Controls
                            </h3>
                            <p className="text-xs text-muted-foreground/60 mb-6 leading-relaxed">
                                Personnel classified as authors may initiate modification or retraction requests using their secure deletion keys.
                            </p>
                            <div className="flex flex-col gap-4">
                                <EditPostButton post={post} />
                                <DeletePostButton postId={post.id} postTitle={post.title} />
                            </div>
                        </div>

                    </aside>
                </div>
            </article>

            <Footer />
        </main>
    );
}
