'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/mock-api';
import { Send, CheckCircle2, ImagePlus, Paperclip, X, Upload, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';

export default function RequestPost() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [password, setPassword] = useState('');
    const [richContent, setRichContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Land Cover Change');

    // Image file uploads
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Document file uploads
    const [docFiles, setDocFiles] = useState<File[]>([]);
    const docInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setImageFiles(prev => [...prev, ...files]);

        // Generate previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreviews(prev => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setDocFiles(prev => [...prev, ...files]);
        if (docInputRef.current) docInputRef.current.value = '';
    };

    const removeDoc = (index: number) => {
        setDocFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async (files: File[]): Promise<string[]> => {
        if (files.length === 0) return [];

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.urls;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setUploading(true);

        const formEl = e.currentTarget;
        const formDataObj = new FormData(formEl);
        const title = formDataObj.get('title') as string;
        const author = formDataObj.get('author') as string;
        const email = formDataObj.get('email') as string;
        const category = selectedCategory === 'Other' ? (formDataObj.get('customCategory') as string) : selectedCategory;
        const abstract = formDataObj.get('abstract') as string;
        const content = richContent; // From TipTap rich text editor
        const authorPassword = formDataObj.get('authorPassword') as string;
        const honeypot = formDataObj.get('organization') as string;

        // Spam protection: if honeypot is filled, simulate success silently
        if (honeypot) {
            setUploading(false);
            setLoading(false);
            setSubmitted(true);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            setLoading(false);
            setUploading(false);
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{6,}$/;
        if (!passwordRegex.test(authorPassword)) {
            alert('Password must be at least 6 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one symbol.');
            setLoading(false);
            setUploading(false);
            return;
        }

        try {
            const [imageUrls, docUrls] = await Promise.all([
                uploadFiles(imageFiles),
                uploadFiles(docFiles),
            ]);

            setUploading(false);

            const data = {
                title,
                author,
                email,
                category,
                abstract,
                content,
                images: imageUrls,
                attachments: docUrls,
                authorPassword,
            };

            await api.submitRequest(data);
            setSubmitted(true);
        } catch (err) {
            console.error('Submission error:', err);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground relative pt-24 pb-0 overflow-hidden">
            <Navbar />

            {/* Glowing Abstract Elements */}
            <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10 flex-1 w-full pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                        Contribute <span className="text-primary font-light">Findings</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-xl mx-auto">
                        Share your analytical results. Once submitted, the admin will review your research before publishing it to the entire intelligence network.
                    </p>
                </motion.div>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card shadow-lg p-12 text-center flex flex-col items-center justify-center border-l-4 border-l-secondary"
                    >
                        <CheckCircle2 className="text-secondary w-20 h-20 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Transmission Successful</h2>
                        <p className="text-muted-foreground mb-8">
                            Your research request is securely enqueued for review. You will be notified via email upon processing.
                        </p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setImageFiles([]);
                                setImagePreviews([]);
                                setDocFiles([]);
                                setPassword('');
                            }}
                            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            Submit Additional Analysis
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="glass-card p-8 md:p-10 border-t-2 border-t-primary/50 relative overflow-hidden group"
                        onSubmit={handleSubmit}
                    >
                        {/* Shimmer Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                        <div className="space-y-8 relative z-10">

                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Transmission Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
                                    placeholder="e.g. Remote Sensing of Mangrove Degredation"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Author Identifier</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Secure Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
                                        placeholder="university.email@edu"
                                        pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                        title="Please enter a valid email address (e.g. user@example.com)"
                                    />
                                </div>
                            </div>

                            {/* Honeypot field - visually hidden */}
                            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                                <label>Organization (Do not fill this out if you are human)</label>
                                <input type="text" name="organization" tabIndex={-1} autoComplete="off" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Author Deletion Password</label>
                                <p className="text-xs text-muted-foreground">This password will be strongly encrypted. You can use it later if you need to delete your published transmission.</p>
                                <input
                                    type="password"
                                    name="authorPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 backdrop-blur-md"
                                    placeholder="Set a secret password..."
                                    autoComplete="new-password"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}"
                                    title="Password must be at least 6 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one symbol."
                                />

                                <div className="mt-4 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
                                    <p className="text-xs font-semibold tracking-wider uppercase text-white/90 mb-3">Password Requirements</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                        <div className={`flex items-center gap-2 transition-colors ${password.length >= 6 ? 'text-secondary' : 'text-muted-foreground'}`}>
                                            {password.length >= 6 ? <Check size={16} /> : <X size={16} className={password.length > 0 ? "text-destructive" : ""} />}
                                            <span className={password.length > 0 && password.length < 6 ? "text-destructive" : ""}>At least 6 characters</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[A-Z]/.test(password) ? 'text-secondary' : 'text-muted-foreground'}`}>
                                            {/[A-Z]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[A-Z]/.test(password) ? "text-destructive" : ""} />}
                                            <span className={password.length > 0 && !/[A-Z]/.test(password) ? "text-destructive" : ""}>One uppercase letter</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[a-z]/.test(password) ? 'text-secondary' : 'text-muted-foreground'}`}>
                                            {/[a-z]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[a-z]/.test(password) ? "text-destructive" : ""} />}
                                            <span className={password.length > 0 && !/[a-z]/.test(password) ? "text-destructive" : ""}>One lowercase letter</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/\d/.test(password) ? 'text-secondary' : 'text-muted-foreground'}`}>
                                            {/\d/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/\d/.test(password) ? "text-destructive" : ""} />}
                                            <span className={password.length > 0 && !/\d/.test(password) ? "text-destructive" : ""}>One number</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[^a-zA-Z0-9]/.test(password) ? 'text-secondary' : 'text-muted-foreground'}`}>
                                            {/[^a-zA-Z0-9]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[^a-zA-Z0-9]/.test(password) ? "text-destructive" : ""} />}
                                            <span className={password.length > 0 && !/[^a-zA-Z0-9]/.test(password) ? "text-destructive" : ""}>One special symbol</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Research Vector</label>
                                <select
                                    name="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 appearance-none backdrop-blur-md cursor-pointer"
                                >
                                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                                        <optgroup key={group} label={group} className="bg-popover text-white/50 font-semibold">
                                            {vectors.map((v: string) => (
                                                <option key={v} value={v} className="bg-popover text-white font-normal">{v}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                    <option value="Other" className="bg-popover text-white">Other</option>
                                </select>
                                {selectedCategory === 'Other' && (
                                    <input
                                        name="customCategory"
                                        required
                                        className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 backdrop-blur-md mt-3"
                                        placeholder="Type your research domain..."
                                    />
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Abstract / Executive Summary</label>
                                <textarea
                                    name="abstract"
                                    required
                                    className="w-full bg-black/50 border border-white/10 focus:border-primary/50 text-white placeholder-white/20 rounded-xl px-5 py-4 outline-none transition-all focus:ring-2 focus:ring-primary/20 resize-y min-h-[120px] backdrop-blur-md"
                                    placeholder="Briefly describe your methodology and key findings..."
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between">
                                    <label className="text-sm font-semibold tracking-wide uppercase text-white/80">Full Intelligence Report</label>
                                    <span className="text-xs text-primary hidden sm:block">Rich Text Editor</span>
                                </div>
                                <RichTextEditor
                                    content={richContent}
                                    onChange={setRichContent}
                                    placeholder="Write your complete blog post here. Use the toolbar above to format headings, lists, quotes, and more..."
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <ImagePlus className="w-5 h-5 text-primary" />
                                    <label className="text-sm font-semibold tracking-wide uppercase text-white">Visual Evidence (Imagery)</label>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                                <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-destructive/80 hover:bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md text-[10px] text-white/70 px-2 py-1 truncate">
                                                    {imageFiles[index]?.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm font-medium transition-all"
                                >
                                    <Upload size={16} />
                                    {imagePreviews.length > 0 ? 'Attach Additional Imagery' : 'Select Imagery'}
                                </button>
                            </div>

                            {/* Document Upload */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-secondary" />
                                    <label className="text-sm font-semibold tracking-wide uppercase text-white">Supporting Documents</label>
                                </div>

                                {docFiles.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {docFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 rounded-xl group relative">
                                                <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                                                <span className="text-sm text-white/90 truncate flex-1">{file.name}</span>
                                                <span className="text-xs text-muted-foreground flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDoc(index)}
                                                    className="text-destructive opacity-50 hover:opacity-100 transition-opacity p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xlsx,.csv,.zip,.txt" multiple onChange={handleDocSelect} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary text-sm font-medium transition-all"
                                >
                                    <Upload size={16} />
                                    {docFiles.length > 0 ? 'Attach Additional Documents' : 'Select Documents'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 py-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-white font-bold text-lg shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                {/* Shine */}
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{uploading ? 'Uplinking Assets...' : 'Transmitting Protocol...'}</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Initiate Submission Protocol</span>
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                )}
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md py-12 text-center text-muted-foreground mt-auto">
                <p className="font-medium text-sm">
                    © {new Date().getFullYear()} Remote Sensing & GIS Intelligence. Built with Next.js, Framer Motion & AWS.
                </p>
            </footer>
        </main>
    );
}
