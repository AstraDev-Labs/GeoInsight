import Navbar from '@/components/Navbar';
import { dataService } from '@/lib/data-service';
import { Calendar, User, Map } from 'lucide-react';
import Link from 'next/link';

export default async function AuthorProfile({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);

    const allPosts = await dataService.getPosts();
    const authorPosts = allPosts.filter(p => p.status === 'published' && p.author.toLowerCase() === decodedName.toLowerCase());

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden relative pb-0">
            <Navbar />

            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="pt-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col items-center justify-center text-center mb-16">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                        <User size={48} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{decodedName}</h1>
                    <p className="text-muted-foreground text-lg">
                        Contributing Researcher
                        <span className="mx-3 text-white/20">•</span>
                        {authorPosts.length} Published Findings
                    </p>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-bold border-b border-white/10 pb-4 flex items-center gap-3">
                        <span className="w-6 h-1 bg-secondary rounded-full" />
                        Research Portfolio
                    </h2>

                    {authorPosts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-2xl border border-white/10">
                            No publications found by this author.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {authorPosts.map(post => (
                                <div key={post.id} className="group border border-white/10 bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-xl hover:shadow-secondary/20 transition-all flex flex-col h-full">
                                    <Link href={`/blog/${post.id}`} className="flex-1 flex flex-col">
                                        {post.images && post.images.length > 0 ? (
                                            <div className="relative h-48 overflow-hidden">
                                                <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                                <div className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                                                    {post.category}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center border-b border-white/5">
                                                <div className="absolute top-4 left-4 bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                                                    {post.category}
                                                </div>
                                                <Map className="w-16 h-16 text-white/30" />
                                            </div>
                                        )}

                                        <div className="p-8 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="px-8 pb-8 mt-auto flex items-center gap-2 text-xs font-medium text-white/50 border-t border-white/10 pt-4">
                                        <Calendar size={14} className="text-muted-foreground" />
                                        {post.postedAt ? new Date(post.postedAt).toLocaleDateString() : post.date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-12 text-center text-muted-foreground mt-auto">
                <p className="font-medium text-sm">
                    © {new Date().getFullYear()} Remote Sensing & GIS Intelligence. Built with Next.js, Framer Motion & AWS.
                </p>
            </footer>
        </main>
    )
}
