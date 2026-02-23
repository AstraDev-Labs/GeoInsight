'use client';

import { useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/mock-api';
import { Send, CheckCircle2, ImagePlus, Paperclip, X, Upload, FileText, Check, Activity } from 'lucide-react';
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
        <main className="min-h-screen flex flex-col bg-[#0a0a0a] text-white relative font-sans">
            <div className="bg-[#111111] border-b border-[#222222] z-20 relative">
                <Navbar />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10 flex-1 w-full pt-16 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 text-[#0ea5e9] font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Activity size={14} /> Intelligence Uplink
                    </div>
                    <h1 className="text-[3rem] md:text-[4.5rem] font-black tracking-tighter mb-8 text-white leading-[0.95]">
                        Log Finding
                    </h1>
                    <p className="text-[#888] text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                        Personnel are requested to upload analytical findings. Once submitted, board review will initiate before publication to the global network.
                    </p>
                </motion.div>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111111] border border-[#222222] p-16 text-center flex flex-col items-center justify-center rounded-3xl shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0ea5e9]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <CheckCircle2 className="text-[#0ea5e9] w-24 h-24 mb-8" />
                        <h2 className="text-[2.5rem] font-black text-white mb-4 tracking-tight leading-[1.1]">Transmission Received</h2>
                        <p className="text-[#888] mb-10 text-lg max-w-md mx-auto">
                            Your research data is securely enqueued for mission control review. Confirmation will follow via secure channel.
                        </p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setImageFiles([]);
                                setImagePreviews([]);
                                setDocFiles([]);
                                setPassword('');
                            }}
                            className="bg-[#1a1a1a] border border-[#333] hover:bg-[#222] hover:text-white text-[#aaa] font-black uppercase tracking-[0.2em] text-xs py-5 px-10 rounded-xl transition-all shadow-xl"
                        >
                            Log Additional Mission
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-[#111111] border border-[#222222] shadow-2xl p-8 md:p-12 rounded-3xl relative overflow-hidden"
                        onSubmit={handleSubmit}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ea5e9]/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="space-y-10 relative z-10">

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Mission Designation (Title)</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold"
                                    placeholder="Enter report title..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Personnel Identifier</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Secure Comms Channel (Email)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold"
                                        placeholder="name@organization.com"
                                    />
                                </div>
                            </div>

                            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                                <label>Organization (Do not fill this out if you are human)</label>
                                <input type="text" name="organization" tabIndex={-1} autoComplete="off" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Secure Access Key</label>
                                <p className="text-[10px] text-[#555] font-bold uppercase tracking-widest">Required for future data retraction or modification requests.</p>
                                <input
                                    type="password"
                                    name="authorPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold mb-4"
                                    placeholder="Set secret key..."
                                    autoComplete="new-password"
                                />

                                <div className="bg-[#151515] p-6 rounded-2xl border border-[#222222]">
                                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#444] mb-4">Encryption Protocols</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-bold uppercase tracking-widest">
                                        <div className={`flex items-center gap-3 transition-colors ${password.length >= 6 ? 'text-[#0ea5e9]' : 'text-[#333]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-[#0ea5e9]' : 'bg-[#222]'}`} />
                                            <span>Min 6 Chars</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[A-Z]/.test(password) ? 'text-[#0ea5e9]' : 'text-[#333]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-[#0ea5e9]' : 'bg-[#222]'}`} />
                                            <span>Uppercase</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[a-z]/.test(password) ? 'text-[#0ea5e9]' : 'text-[#333]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-[#0ea5e9]' : 'bg-[#222]'}`} />
                                            <span>Lowercase</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/\d/.test(password) ? 'text-[#0ea5e9]' : 'text-[#333]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-[#0ea5e9]' : 'bg-[#222]'}`} />
                                            <span>Numeric</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[^a-zA-Z0-9]/.test(password) ? 'text-[#0ea5e9]' : 'text-[#333]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-[#0ea5e9]' : 'bg-[#222]'}`} />
                                            <span>Special</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Intelligence Class (Vectors)</label>
                                <div className="w-full bg-[#151515] border border-[#222222] rounded-2xl p-8 max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                                        <div key={group} className="mb-8 last:mb-0">
                                            <span className="text-[#333] font-black uppercase text-[10px] tracking-[0.2em] mb-4 block">{group}</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {vectors.map((v: string) => (
                                                    <label key={v} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(v) ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-[#333] group-hover:border-[#444]'}`}>
                                                            {selectedCategories.includes(v) && <Check size={10} className="text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(v)}
                                                            onChange={() => toggleCategory(v)}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${selectedCategories.includes(v) ? 'text-white' : 'text-[#555] group-hover:text-white'}`}>{v}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-6 pt-6 border-t border-[#222222]">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.includes('Other') ? 'bg-[#0ea5e9] border-[#0ea5e9]' : 'border-[#333] group-hover:border-[#444]'}`}>
                                                {selectedCategories.includes('Other') && <Check size={10} className="text-white" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes('Other')}
                                                onChange={() => toggleCategory('Other')}
                                                className="hidden"
                                            />
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${selectedCategories.includes('Other') ? 'text-white' : 'text-[#444] group-hover:text-white'}`}>Custom Classification</span>
                                        </label>
                                        {selectedCategories.includes('Other') && (
                                            <input
                                                name="customCategory"
                                                required
                                                className="w-full bg-[#111] border border-[#333] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 mt-4 text-xs font-bold"
                                                placeholder="Enter custom vector classification..."
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Sensor Origin</label>
                                    <input
                                        type="text"
                                        name="satellite"
                                        className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold"
                                        placeholder="e.g. Sentinel-2, Landsat 8"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Geographic Target</label>
                                    <input
                                        type="text"
                                        name="areaOfInterest"
                                        className="w-full bg-[#1a1a1a] border border-[#222222] focus:border-[#0ea5e9]/50 text-white placeholder-[#222] px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-[#0ea5e9]/5 text-sm font-bold"
                                        placeholder="Region or Coordinates"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Mission Logs & Analysis</label>
                                <RichTextEditor
                                    content={richContent}
                                    onChange={setRichContent}
                                    placeholder="Enter complete technical analysis and report logs..."
                                />
                            </div>

                            <div className="space-y-6 pt-6 border-t border-[#222222]">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444] flex items-center gap-3">
                                    <ImagePlus className="w-4 h-4 text-[#0ea5e9]" /> Satellite Imagery
                                </label>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group overflow-hidden border border-[#222222] bg-[#1a1a1a] rounded-xl aspect-square">
                                                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1a1a1a] border border-[#333] hover:border-[#0ea5e9]/50 text-[#aaa] hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl w-full"
                                >
                                    <Upload size={16} />
                                    {imagePreviews.length > 0 ? 'Log Additional Image Data' : 'Upload Sensory Imagery'}
                                </button>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-[#222222]">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444] flex items-center gap-3">
                                    <Paperclip className="w-4 h-4 text-[#0ea5e9]" /> Supplemental Datasets
                                </label>

                                {docFiles.length > 0 && (
                                    <div className="space-y-3">
                                        {docFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-4 bg-[#1a1a1a] border border-[#222222] px-6 py-4 rounded-xl group">
                                                <FileText className="w-5 h-5 text-[#0ea5e9]" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-white truncate">{file.name}</p>
                                                    <p className="text-[10px] text-[#444] font-black">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDoc(index)}
                                                    className="text-red-500 opacity-20 group-hover:opacity-100 transition-opacity p-2"
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
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-[#1a1a1a] border border-[#333] hover:border-[#0ea5e9]/50 text-[#aaa] hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl w-full"
                                >
                                    <Upload size={16} />
                                    {docFiles.length > 0 ? 'Log Additional Datasets' : 'Upload Primary Datasets'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-12 py-5 bg-[#0ea5e9] hover:bg-[#38bdf8] text-white font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all disabled:opacity-50 shadow-xl hover:shadow-[#0ea5e9]/40 rounded-2xl relative overflow-hidden text-xs"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{uploading ? 'Uplinking Telemetry...' : 'Executing Transmission...'}</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Initiate Uplink</span>
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
