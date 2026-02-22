import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
        <main className="min-h-[100vh] flex flex-col bg-white text-black transition-colors duration-500 font-sans">
            <div className="bg-[#1a1a1a] shadow-md z-20 relative w-full">
                <Navbar />
            </div>

            <article className="flex-[1] w-full bg-white pb-16">

                <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-[#006699] hover:text-[#004f7a] text-xs font-bold uppercase tracking-widest mb-6 transition-colors font-sans">
                        <ArrowLeft size={16} /> Back to Blog Posts
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
                    <div className="text-left w-full border-b border-[#e5e5e5] pb-8">
                        <h1 className="text-[2.5rem] md:text-[3.2rem] font-bold leading-[1.15] mb-6 text-[#222222] tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-col md:flex-row md:items-start gap-8 mt-6">
                            {/* Standard Metadata */}
                            <div className="flex flex-col gap-3 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase tracking-widest text-[#888888] text-[10px]">Date</span>
                                    <span className="font-bold text-[#222222] text-sm">
                                        {postedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase tracking-widest text-[#888888] text-[10px]">Author</span>
                                    <Link href={`/author/${encodeURIComponent(post.author)}`} className="font-bold text-[#006699] text-sm hover:underline">
                                        {post.author}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase tracking-widest text-[#888888] text-[10px]">Domain</span>
                                    <span className="font-bold text-[#222222] text-xs bg-[#f0f0f0] px-2 py-0.5 uppercase tracking-wider">
                                        {post.category || 'Earth Sciences'}
                                    </span>
                                </div>
                            </div>

                            {/* New Tags Metadata */}
                            {(post.satellite || post.areaOfInterest) && (
                                <div className="flex flex-col gap-3 min-w-[200px] border-l-0 md:border-l md:border-[#e5e5e5] md:pl-8">
                                    {post.areaOfInterest && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold uppercase tracking-widest text-[#888888] text-[10px]">Location</span>
                                            <span className="font-bold text-[#222222] text-sm max-w-[200px] truncate" title={post.areaOfInterest}>
                                                {post.areaOfInterest}
                                            </span>
                                        </div>
                                    )}
                                    {post.satellite && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold uppercase tracking-widest text-[#888888] text-[10px]">Sensor(s)</span>
                                            <span className="font-bold text-[#222222] text-sm max-w-[200px] truncate" title={post.satellite}>
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
                        <div className="prose prose-lg max-w-none text-[#222] prose-p:leading-[1.8] prose-p:text-[1.1rem] prose-p:font-[400] prose-p:mb-6 prose-a:text-[#006699] prose-a:font-bold hover:prose-a:underline prose-headings:text-[#111] prose-headings:font-bold prose-headings:mt-10 prose-strong:text-[#000] prose-blockquote:border-l-4 prose-blockquote:border-[#ccc] prose-blockquote:pl-6 prose-blockquote:text-[#555] prose-blockquote:italic prose-img:mt-8 prose-img:mb-4 prose-img:rounded-none">
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
                            <div className="mt-16 pt-8 border-t border-[#e5e5e5]">
                                <h3 className="text-xl font-bold text-[#111] mb-6 uppercase tracking-wider text-sm flex items-center gap-3">
                                    Additional Imagery
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {post.images.slice(1).map((img, i) => (
                                        <a href={img} target="_blank" rel="noopener noreferrer" key={i} className="relative block group bg-[#f0f0f0] aspect-square overflow-hidden cursor-pointer rounded-none border border-[#e5e5e5]">
                                            <img
                                                src={img}
                                                alt={`${post.title} supplementary image ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1 backdrop-blur-sm">View</span>
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
                        <div className="bg-[#f0f0f0] border border-[#d5d5d5] p-6 mb-8 mt-12 lg:mt-0">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#222] mb-4 flex items-center gap-2">
                                <FileText size={16} className="text-[#006699]" /> Datasets / Downloads
                            </h3>

                            {post.attachments && post.attachments.length > 0 ? (
                                <div className="space-y-3">
                                    {post.attachments.map((att, i) => (
                                        <a
                                            key={i}
                                            href={att}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col p-3 bg-white border border-[#d5d5d5] hover:border-[#006699] transition-colors"
                                        >
                                            <span className="text-[#006699] font-bold text-[0.85rem] group-hover:underline flex justify-between items-center break-all">
                                                Attachment file {i + 1}
                                                <ExternalLink size={14} className="text-[#888888] shrink-0 ml-2" />
                                            </span>
                                            <span className="text-xs text-[#888888] mt-1 break-all flex items-center gap-1">
                                                <Tag size={10} /> {att.split('/').pop()?.substring(0, 30) || 'Document file'}...
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#555] bg-white p-4 border border-[#e5e5e5]">No external datasets or references provided for this abstract.</p>
                            )}
                        </div>

                        {/* Author Controls */}
                        <div className="bg-[#fffdfd] border border-[#ffdddd] p-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#990000] mb-2 flex items-center gap-2">
                                Author Actions
                            </h3>
                            <p className="text-xs text-[#555] mb-4 leading-relaxed">
                                If you authored this report and need to retract or modify the data, you may initiate a request here.
                            </p>
                            <div className="flex flex-col gap-3">
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
