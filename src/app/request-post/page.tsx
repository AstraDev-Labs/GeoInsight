import TurnstileWidget from "@/components/TurnstileWidget";

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
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
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

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
        }
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
        } catch (err: any) {
            console.error('Submission error:', err);
            alert(`There was an error submitting your request:\n\n${err.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    }

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground relative font-sans transition-colors duration-500">
            <div className="bg-background border-b z-20 relative">
                <Navbar />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10 flex-1 w-full pt-16 pb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                        <Activity size={14} /> Intelligence Uplink
                    </div>
                    <h1 className="text-[3rem] md:text-[4.5rem] font-black tracking-tighter mb-8 text-foreground leading-[0.95]">
                        Log Finding
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                        Personnel are requested to upload analytical findings. Once submitted, board review will initiate before publication to the global network.
                    </p>
                </motion.div>

                {submitted ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border p-16 text-center flex flex-col items-center justify-center rounded-3xl shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <CheckCircle2 className="text-primary w-24 h-24 mb-8" />
                        <h2 className="text-[2.5rem] font-black text-foreground mb-4 tracking-tight leading-[1.1]">Transmission Received</h2>
                        <p className="text-muted-foreground mb-10 text-lg max-w-md mx-auto">
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
                            className="bg-muted border text-muted-foreground font-black uppercase tracking-[0.2em] text-xs py-5 px-10 rounded-xl transition-all shadow-xl hover:bg-muted/80 hover:text-foreground"
                        >
                            Log Additional Mission
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-card border shadow-2xl p-8 md:p-12 rounded-3xl relative overflow-hidden"
                        onSubmit={handleSubmit}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="space-y-10 relative z-10">

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Mission Designation (Title)</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-foreground/30 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold"
                                    placeholder="Enter report title..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Personnel Identifier</label>
                                    <input
                                        type="text"
                                        name="author"
                                        required
                                        className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Secure Comms Channel (Email)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold"
                                        placeholder="name@organization.com"
                                    />
                                </div>
                            </div>

                            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                                <label>Organization (Do not fill this out if you are human)</label>
                                <input type="text" name="organization" tabIndex={-1} autoComplete="off" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Secure Access Key</label>
                                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">Required for future data retraction or modification requests.</p>
                                <input
                                    type="password"
                                    name="authorPassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold mb-4"
                                    placeholder="Set secret key..."
                                    autoComplete="new-password"
                                />

                                <div className="bg-muted/30 p-6 rounded-2xl border">
                                    <p className="text-[10px] font-black tracking-[0.2em] uppercase text-foreground/50 mb-4">Encryption Protocols</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-bold uppercase tracking-widest">
                                        <div className={`flex items-center gap-3 transition-colors ${password.length >= 6 ? 'text-primary' : 'text-muted-foreground/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-primary' : 'bg-muted-foreground/10'}`} />
                                            <span>Min 6 Chars</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[A-Z]/.test(password) ? 'text-primary' : 'text-muted-foreground/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(password) ? 'bg-primary' : 'bg-muted-foreground/10'}`} />
                                            <span>Uppercase</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[a-z]/.test(password) ? 'text-primary' : 'text-muted-foreground/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(password) ? 'bg-primary' : 'bg-muted-foreground/10'}`} />
                                            <span>Lowercase</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/\d/.test(password) ? 'text-primary' : 'text-muted-foreground/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(password) ? 'bg-primary' : 'bg-muted-foreground/10'}`} />
                                            <span>Numeric</span>
                                        </div>
                                        <div className={`flex items-center gap-3 transition-colors ${/[^a-zA-Z0-9]/.test(password) ? 'text-primary' : 'text-muted-foreground/20'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(password) ? 'bg-primary' : 'bg-muted-foreground/10'}`} />
                                            <span>Special</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Intelligence Class (Vectors)</label>
                                <div className="w-full bg-muted/30 border rounded-2xl p-8 max-h-[350px] overflow-y-auto custom-scrollbar">
                                    {Object.entries(RESEARCH_VECTOR_GROUPS).map(([group, vectors]) => (
                                        <div key={group} className="mb-8 last:mb-0">
                                            <span className="text-foreground/50 font-black uppercase text-[10px] tracking-[0.2em] mb-4 block">{group}</span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {vectors.map((v: string) => (
                                                    <label key={v} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.includes(v) ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                                                            {selectedCategories.includes(v) && <Check size={10} className="text-primary-foreground" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.includes(v)}
                                                            onChange={() => toggleCategory(v)}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${selectedCategories.includes(v) ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground'}`}>{v}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-6 pt-6 border-t font-sans">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.includes('Other') ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}`}>
                                                {selectedCategories.includes('Other') && <Check size={10} className="text-primary-foreground" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes('Other')}
                                                onChange={() => toggleCategory('Other')}
                                                className="hidden"
                                            />
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${selectedCategories.includes('Other') ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground'}`}>Custom Classification</span>
                                        </label>
                                        {selectedCategories.includes('Other') && (
                                            <input
                                                name="customCategory"
                                                required
                                                className="w-full bg-background border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 mt-4 text-xs font-bold"
                                                placeholder="Enter custom vector classification..."
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Sensor Origin</label>
                                    <input
                                        type="text"
                                        name="satellite"
                                        className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold"
                                        placeholder="e.g. Sentinel-2, Landsat 8"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Geographic Target</label>
                                    <input
                                        type="text"
                                        name="areaOfInterest"
                                        className="w-full bg-muted/30 border focus:border-primary/50 text-foreground placeholder-muted-foreground/20 px-6 py-4 rounded-xl outline-none transition-all focus:ring-4 focus:ring-primary/5 text-sm font-bold"
                                        placeholder="Region or Coordinates"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Mission Logs & Analysis</label>
                                <RichTextEditor
                                    content={richContent}
                                    onChange={setRichContent}
                                    placeholder="Enter complete technical analysis and report logs..."
                                />
                            </div>

                            <div className="space-y-6 pt-6 border-t">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 flex items-center gap-3">
                                    <ImagePlus className="w-4 h-4 text-primary" /> Satellite Imagery
                                </label>

                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group overflow-hidden border bg-muted/30 rounded-xl aspect-square">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-muted/30 border hover:border-primary/50 text-muted-foreground/60 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl w-full"
                                >
                                    <Upload size={16} />
                                    {imagePreviews.length > 0 ? "Log Additional Image Data" : "Upload Sensory Imagery"}
                                </button>
                            </div>

                            <div className="space-y-6 pt-6 border-t">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 flex items-center gap-3">
                                    <Paperclip className="w-4 h-4 text-primary" /> Supplemental Datasets
                                </label>

                                {docFiles.length > 0 && (
                                    <div className="space-y-3">
                                        {docFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-4 bg-muted/30 border px-6 py-4 rounded-xl group">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-foreground truncate">{file.name}</p>
                                                    <p className="text-[10px] text-foreground/40 font-black">{(file.size / 1024).toFixed(1)} KB</p>
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

                                <input ref={docInputRef} type="file" multiple onChange={handleDocSelect} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => docInputRef.current?.click()}
                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-muted/30 border hover:border-primary/50 text-muted-foreground/60 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl w-full"
                                >
                                    <Upload size={16} />
                                    {docFiles.length > 0 ? "Log Additional Datasets" : "Upload Primary Datasets"}
                                </button>
                            </div>

                            {errorMsg && <p className="text-destructive font-semibold text-center mt-4">{errorMsg}</p>}

                            <TurnstileWidget onVerify={setTurnstileToken} action="request_post" />

                            <button
                                type="submit"
                                disabled={isSubmitting || !turnstileToken}
                                disabled={loading}
                                className="w-full mt-12 py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all disabled:opacity-50 shadow-xl hover:shadow-primary/40 rounded-2xl relative overflow-hidden text-xs"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{uploading ? "Uplinking Telemetry..." : "Executing Transmission..."}</span>
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
