"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import { ImageUpload } from "@/components/admin/ImageUpload";
import 'react-quill-new/dist/quill.snow.css';

// @ts-ignore
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateBlogPost() {
    const router = useRouter();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isRestored, setIsRestored] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        excerpt: "",
        content: "",
        image: null as File | null,
        status: "published", // default
        access_tier: "auto"
    });

    // Load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem("blog_create_draft");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
                setIsRestored(true);
                toast({ title: "Draft restored", description: "Your unsaved changes were recovered." });
            } catch (e) { }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save draft on change
    useEffect(() => {
        // Don't autosave empty form initially
        if (!formData.title && !formData.content) return;

        const draft = {
            title: formData.title,
            category: formData.category,
            excerpt: formData.excerpt,
            content: formData.content,
            status: formData.status,
            access_tier: formData.access_tier
        };
        const timer = setTimeout(() => {
            localStorage.setItem("blog_create_draft", JSON.stringify(draft));
            setLastSaved(new Date());
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData.title, formData.category, formData.excerpt, formData.content, formData.status, formData.access_tier]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('category', formData.category);
            payload.append('status', formData.status);
            payload.append('access_tier', formData.access_tier);
            if (formData.excerpt) payload.append('excerpt', formData.excerpt);
            payload.append('content', formData.content);
            if (formData.image) {
                payload.append('image', formData.image);
            }

            await api.post("/blog", payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.removeItem("blog_create_draft");
            toast({
                title: "Post Published",
                description: "The new article has been successfully added to the blog.",
            });
            router.push("/admin/blog");
        } catch (err: any) {
            console.error("Failed to create post", err);
            toast({
                variant: 'destructive',
                title: "Failed to create",
                description: err.response?.data?.message || "There was an error saving this post.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <Link href="/admin/blog" className="inline-flex items-center text-red-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-[#003366] transition-colors">
                        <ArrowLeft size={14} className="mr-2" /> Back to Articles
                    </Link>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Write New Post</h2>
                    <p className="text-slate-500 font-medium italic">Create and publish content to the South Ring Journal.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 max-w-4xl">
                <div className="space-y-8">

                    {/* Title */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Article Title *</label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 5 Warning Signs of Brake Failure. . ."
                            className="bg-slate-50 border-slate-100 rounded-2xl h-14 px-6 text-sm font-bold text-[#003366] focus:ring-4 focus:ring-red-600/10 focus:border-red-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Category */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 text-sm font-bold text-[#003366] focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 appearance-none"
                            >
                                <option value="" disabled>Select category</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Tips & Tricks">Tips & Tricks</option>
                                <option value="Technology">Technology</option>
                                <option value="News">News</option>
                                <option value="Safety">Safety</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Initial Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 text-sm font-bold text-[#003366] focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 appearance-none"
                            >
                                <option value="published">Published Live</option>
                                <option value="draft">Save as Draft</option>
                            </select>
                        </div>

                        {/* Access Tier */}
                        <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Content Access Tier</label>
                            <select
                                name="access_tier"
                                value={formData.access_tier}
                                onChange={handleChange}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 text-sm font-bold text-[#003366] focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 appearance-none"
                            >
                                <option value="auto">Auto (Current Year = Free, Past Year = Premium)</option>
                                <option value="free">Always Free (Never requires Journal)</option>
                                <option value="premium">Always Premium (Always requires Journal)</option>
                            </select>
                            <p className="text-[10px] text-slate-500 ml-2 italic">Determine if readers must purchase a Journal to read this full article.</p>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <ImageUpload
                        label="Feature Image"
                        value={formData.image}
                        onChange={(file) => setFormData({ ...formData, image: file })}
                    />

                    {/* Excerpt */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Excerpt (Short Summary)</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={3}
                            placeholder="A concise two-sentence hook displayed on the blog grid..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-bold text-[#003366] focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 resize-none"
                        />
                    </div>

                    {/* Main Content */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Article Content *</label>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-white [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-100 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-[#003366]">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                placeholder="Write your amazing article here..."
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div>
                            {lastSaved && <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Draft Autosaved at {lastSaved.toLocaleTimeString()}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            {isRestored && (
                                <Button type="button" variant="outline" className="rounded-2xl h-14 px-6 text-[10px] font-black uppercase tracking-widest" onClick={() => { localStorage.removeItem("blog_create_draft"); window.location.reload(); }}>
                                    Discard Draft
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin mr-3" /> : <Save size={16} className="mr-3" />}
                                Publish Article
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
