'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/mock-api';
import { Send, CheckCircle2, ImagePlus, Paperclip, X, Upload, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import { RESEARCH_VECTOR_GROUPS } from '@/lib/categories';

export default function RequestPost() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [password, setPassword] = useState('');
    const [richContent, setRichContent] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['Land Cover Change']);

    const toggleCategory = (vector: string) => {
        setSelectedCategories(prev =>
            prev.includes(vector) ? prev.filter(c => c !== vector) : [...prev, vector]
        );
    };

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

        let category = selectedCategories.filter(c => c !== 'Other').join(', ');
        const customCat = formDataObj.get('customCategory') as string;
        if (selectedCategories.includes('Other') && customCat) {
            category = category ? `${category}, ${customCat}` : customCat;
        }

        const content = richContent; // From TipTap rich text editor
        const authorPassword = formDataObj.get('authorPassword') as string;
        const satellite = formDataObj.get('satellite') as string;
        const areaOfInterest = formDataObj.get('areaOfInterest') as string;
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
                content,
                images: imageUrls,
                attachments: docUrls,
                authorPassword,
                satellite,
                areaOfInterest,
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
        <main className="min-h-screen flex flex-col bg-white text-black relative">
            <div className="bg-[#1a1a1a] shadow-md z-20 relative">
                <Navbar />
            </div>

            <div className="max-w-3xl mx-auto px-6 relative z-10 flex-1 w-full pt-16 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#222]">
                        Contribute <span className="text-[#006699] font-light">Findings</span>
                    </h1>
                    <p className="text-[#555] text-lg font-light leading-relaxed max-w-xl mx-auto">
                        Share your analytical results. Once submitted, the admin will review your research before publishing it to the entire intelligence network.
                    </p>
                </motion.div>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-[#e5e5e5] shadow-sm p-12 text-center flex flex-col items-center justify-center border-l-4 border-l-[#006699]"
                    >
                        <CheckCircle2 className="text-[#006699] w-20 h-20 mb-6" />
                        <h2 className="text-3xl font-bold text-[#222] mb-3 tracking-tight">Transmission Successful</h2>
                        <p className="text-[#555] mb-8">
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
                            className="bg-[#f0f0f0] border border-[#d5d5d5] hover:bg-[#e5e5e5] text-[#222] font-bold py-3 px-8 transition-all"
                        >
                            Submit Additional Analysis
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-white border border-[#e5e5e5] shadow-sm p-8 md:p-10 border-t-4 border-t-[#006699]"
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-8 relative z-10">

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Transmission Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                    placeholder="e.g. Remote Sensing of Mangrove Degredation"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Author Identifier</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Secure Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                        placeholder="university.email@edu"
                                        pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                    />
                                </div>
                            </div>

                            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                                <label>Organization (Do not fill this out if you are human)</label>
                                <input type="text" name="organization" tabIndex={-1} autoComplete="off" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Author Deletion Password</label>
                                <p className="text-xs text-[#777]">This password will be strongly encrypted. You can use it later if you need to delete your published transmission.</p>
                                <input
                                    type="password"
                                    name="authorPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                    placeholder="Set a secret password..."
                                    autoComplete="new-password"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}"
                                />

                                <div className="mt-4 bg-[#f4f4f4] p-4 border border-[#e5e5e5]">
                                    <p className="text-xs font-bold tracking-widest uppercase text-[#333] mb-3">Password Requirements</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                        <div className={`flex items-center gap-2 transition-colors ${password.length >= 6 ? 'text-[#006699]' : 'text-[#777]'}`}>
                                            {password.length >= 6 ? <Check size={16} /> : <X size={16} className={password.length > 0 ? "text-red-500" : ""} />}
                                            <span className={password.length > 0 && password.length < 6 ? "text-red-500" : ""}>At least 6 characters</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[A-Z]/.test(password) ? 'text-[#006699]' : 'text-[#777]'}`}>
                                            {/[A-Z]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[A-Z]/.test(password) ? "text-red-500" : ""} />}
                                            <span className={password.length > 0 && !/[A-Z]/.test(password) ? "text-red-500" : ""}>One uppercase letter</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[a-z]/.test(password) ? 'text-[#006699]' : 'text-[#777]'}`}>
                                            {/[a-z]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[a-z]/.test(password) ? "text-red-500" : ""} />}
                                            <span className={password.length > 0 && !/[a-z]/.test(password) ? "text-red-500" : ""}>One lowercase letter</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/\d/.test(password) ? 'text-[#006699]' : 'text-[#777]'}`}>
                                            {/\d/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/\d/.test(password) ? "text-red-500" : ""} />}
                                            <span className={password.length > 0 && !/\d/.test(password) ? "text-red-500" : ""}>One number</span>
                                        </div>
                                        <div className={`flex items-center gap-2 transition-colors ${/[^a-zA-Z0-9]/.test(password) ? 'text-[#006699]' : 'text-[#777]'}`}>
                                            {/[^a-zA-Z0-9]/.test(password) ? <Check size={16} /> : <X size={16} className={password.length > 0 && !/[^a-zA-Z0-9]/.test(password) ? "text-red-500" : ""} />}
                                            <span className={password.length > 0 && !/[^a-zA-Z0-9]/.test(password) ? "text-red-500" : ""}>One symbol</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Research Vector(s)</label>
                                <div className="w-full bg-[#f9f9f9] border border-[#d5d5d5] p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                                        <div key={group} className="mb-4 last:mb-0">
                                            <span className="text-[#888] font-bold uppercase text-xs mb-2 block">{group}</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {vectors.map((v: string) => (
                                                    <label key={v} className="flex items-start gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(v)}
                                                            onChange={() => toggleCategory(v)}
                                                            className="mt-1 w-4 h-4 text-[#006699] border-[#d5d5d5] rounded focus:ring-[#006699]"
                                                        />
                                                        <span className="text-[#333] text-sm group-hover:text-[#006699] transition-colors">{v}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-4 border-t border-[#d5d5d5]">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes('Other')}
                                                onChange={() => toggleCategory('Other')}
                                                className="mt-1 w-4 h-4 text-[#006699] border-[#d5d5d5] rounded focus:ring-[#006699]"
                                            />
                                            <span className="text-[#333] text-sm group-hover:text-[#006699] transition-colors font-bold">Other / Custom Vector</span>
                                        </label>
                                        {selectedCategories.includes('Other') && (
                                            <input
                                                name="customCategory"
                                                required
                                                className="w-full bg-white border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-4 py-2 outline-none transition-all focus:ring-1 focus:ring-[#006699] mt-3 text-sm"
                                                placeholder="Type your custom research domain..."
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Satellite / Sensor Tag</label>
                                    <input
                                        type="text"
                                        name="satellite"
                                        className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                        placeholder="e.g. Sentinel-2, Landsat 8"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Area of Interest</label>
                                    <input
                                        type="text"
                                        name="areaOfInterest"
                                        className="w-full bg-[#f9f9f9] border border-[#d5d5d5] focus:border-[#006699] text-[#222] placeholder-[#888] px-5 py-3 outline-none transition-all focus:ring-1 focus:ring-[#006699]"
                                        placeholder="Target location coords or Region"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between">
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#555]">Full Intelligence Report</label>
                                    <span className="text-xs text-[#006699] hidden sm:block">Rich Text Editor</span>
                                </div>
                                <RichTextEditor
                                    content={richContent}
                                    onChange={setRichContent}
                                    placeholder="Write your complete blog post here. Use the toolbar above to format headings, lists, quotes, and more..."
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
                                <div className="flex items-center gap-2">
                                    <ImagePlus className="w-5 h-5 text-[#006699]" />
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#222]">Visual Evidence (Imagery)</label>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group overflow-hidden border border-[#d5d5d5] bg-[#f9f9f9]">
                                                <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <div className="absolute bottom-0 inset-x-0 bg-white/90 text-[10px] text-[#222] font-bold px-2 py-1 truncate">
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
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#f0f0f0] border border-[#d5d5d5] hover:bg-[#e5e5e5] text-[#222] text-sm font-bold uppercase tracking-widest transition-all w-full md:w-auto"
                                >
                                    <Upload size={16} />
                                    {imagePreviews.length > 0 ? 'Attach Additional Imagery' : 'Select Imagery'}
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#e5e5e5]">
                                <div className="flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-[#006699]" />
                                    <label className="text-xs font-bold uppercase tracking-widest text-[#222]">Supporting Documents</label>
                                </div>

                                {docFiles.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {docFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-[#f9f9f9] border border-[#d5d5d5] px-4 py-3 group relative">
                                                <FileText className="w-4 h-4 text-[#006699] flex-shrink-0" />
                                                <span className="text-sm text-[#333] font-medium truncate flex-1">{file.name}</span>
                                                <span className="text-xs text-[#888] flex-shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDoc(index)}
                                                    className="text-red-500 opacity-50 hover:opacity-100 transition-opacity p-1"
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
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#f0f0f0] border border-[#d5d5d5] hover:bg-[#e5e5e5] text-[#222] text-sm font-bold uppercase tracking-widest transition-all w-full md:w-auto"
                                >
                                    <Upload size={16} />
                                    {docFiles.length > 0 ? 'Attach Additional Documents' : 'Select Documents'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 py-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-sm"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{uploading ? 'Uploading Files...' : 'Submitting Data...'}</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Submit Data Finding</span>
                                        <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                )}
            </div>

            <Footer />
        </main>
    );
}
