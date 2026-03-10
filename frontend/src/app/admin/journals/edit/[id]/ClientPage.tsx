"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Upload, Loader2, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";
export default function EditJournalPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [attachedBlogs, setAttachedBlogs] = useState<any[]>([]);
    const [availableBlogs, setAvailableBlogs] = useState<any[]>([]);
    const [selectedBlogToAdd, setSelectedBlogToAdd] = useState("");
    const [attachingBlog, setAttachingBlog] = useState(false);

    const [formData, setFormData] = useState({
        year: new Date().getFullYear().toString(),
        title: "",
        description: "",
        price: "",
        image: null as File | null,
        is_active: true
    });

    useEffect(() => {
        if (params.id) {
            fetchJournal();
            fetchAttachedBlogs();
            fetchAllBlogs();
        }
    }, [params.id]);

    const fetchAttachedBlogs = async () => {
        try {
            const res = await api.get(`/admin/journals/${params.id}/blogs`);
            setAttachedBlogs(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch attached blogs", err);
        }
    };

    const fetchAllBlogs = async () => {
        try {
            const res = await api.get('/blog');
            setAvailableBlogs(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch available blogs", err);
        }
    };

    const handleAttachBlog = async () => {
        if (!selectedBlogToAdd) return;
        setAttachingBlog(true);
        try {
            const res = await api.post(`/admin/journals/${params.id}/blogs`, { blog_id: selectedBlogToAdd });
            setAttachedBlogs(res.data.data);
            setSelectedBlogToAdd("");
            toast({ title: "Featured Blog Added", description: "The blog is now linked to this journal." });
        } catch (err: any) {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to add blog." });
        } finally {
            setAttachingBlog(false);
        }
    };

    const handleDetachBlog = async (blogId: number) => {
        if (!confirm("Remove this blog from this journal's featured list?")) return;
        try {
            const res = await api.delete(`/admin/journals/${params.id}/blogs/${blogId}`);
            setAttachedBlogs(res.data.data);
            toast({ title: "Featured Blog Removed", description: "The blog has been unlinked." });
        } catch (err: any) {
            console.error(err);
            toast({ variant: "destructive", title: "Error", description: err.response?.data?.message || "Failed to remove blog." });
        }
    };

    const fetchJournal = async () => {
        try {
            const res = await api.get(`/journals/${params.id}`);
            const data = res.data?.data;

            if (!data) {
                throw new Error("Journal data is undefined");
            }

            setFormData({
                year: data.year?.toString() || new Date().getFullYear().toString(),
                title: data.title || "",
                description: data.description || "",
                price: data.price?.toString() || "",
                is_active: data.is_active !== undefined ? !!data.is_active : true,
                image: null
            });
            if (data.image_url) {
                setImagePreview(data.image_url.startsWith('http') ? data.image_url : `${ASSET_URL}/${data.image_url}`);
            }
        } catch (err: any) {
            console.error("Failed to load journal", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load journal for editing." });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append("_method", "POST"); // Laravel spoofing for POST with _method=PUT natively handled by router below, or we just pass it
            submitData.append("year", formData.year);
            submitData.append("title", formData.title);
            submitData.append("description", formData.description);
            submitData.append("price", formData.price);
            submitData.append("is_active", formData.is_active ? "1" : "0");

            if (formData.image) {
                submitData.append("cover_image", formData.image);
            }

            await api.post(`/admin/journals/${params.id}`, submitData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast({ title: "Journal Updated", description: `Journal successfully updated as ${status}.` });
            router.push("/admin/journals");
        } catch (err: any) {
            console.error("Failed to update journal", err);
            toast({ variant: "destructive", title: "Update Failed", description: err.response?.data?.message || "Could not update the journal." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                    <Loader2 size={40} className="animate-spin mb-4 text-[#003366]" />
                    <p className="text-sm font-black uppercase tracking-widest text-[#003366]">Loading Journal...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-24">
                <div className="flex items-center space-x-4 mb-8">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#003366] hover:border-[#003366] transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-3 py-1 bg-blue-50 text-[#003366] text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100">Journal Editing</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">Edit Journal</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <form onSubmit={(e) => handleSubmit(e)} className="p-8 lg:p-12 space-y-10">
                        {/* Title & Details Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Journal Title *</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-16 bg-slate-50 border-slate-100 rounded-2xl px-6 text-lg font-black text-[#003366] placeholder:text-slate-300 focus:ring-amber-500/10 focus:border-amber-500 shadow-none transition-all"
                                    placeholder="Enter a descriptive title..."
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Year *</label>
                                <Input
                                    type="number"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-[#003366] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Price & Status Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Price (KES) *</label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-[#003366] focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none"
                                    required
                                    placeholder="e.g. 5000"
                                />
                            </div>

                            <div className="flex items-center space-x-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl h-16 mt-7">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-6 h-6 rounded-md border-slate-300 text-amber-500 focus:ring-amber-500"
                                />
                                <label htmlFor="is_active" className="flex flex-col cursor-pointer">
                                    <span className="text-sm font-black text-[#003366] uppercase tracking-wide">Active</span>
                                    <span className="text-[10px] font-medium text-slate-500 italic">Publish this journal to clients</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-medium text-[#003366] placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all resize-none h-32"
                                placeholder="A brief summary of this journal requirements..."
                            />
                        </div>

                        {/* Cover Image Upload (Drag & Drop styled) */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Cover Image</label>
                            <div className="relative w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center overflow-hidden group hover:border-amber-500 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="z-20 flex flex-col items-center bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl transform scale-95 group-hover:scale-100 transition-transform">
                                            <ImageIcon size={24} className="text-[#003366] mb-2" />
                                            <span className="text-xs font-black text-[#003366] uppercase tracking-widest">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-500 transition-colors">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                            <Upload size={24} />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-tight">Click or drag image to upload</span>
                                        <span className="text-[10px] font-medium italic mt-2">Maximum file size: 5MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Featured Blogs Selection */}
                        <div className="pt-8 border-t border-slate-50">
                            <h3 className="text-sm font-black text-[#003366] uppercase tracking-wider mb-6">Featured Blogs</h3>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <select
                                    value={selectedBlogToAdd}
                                    onChange={(e) => setSelectedBlogToAdd(e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl h-14 px-6 text-sm font-bold text-[#003366] focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 appearance-none"
                                >
                                    <option value="" disabled>Select a blog to feature...</option>
                                    {availableBlogs.filter(b => !attachedBlogs.some(ab => ab.id === b.id)).map(blog => (
                                        <option key={blog.id} value={blog.id}>{blog.title}</option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={handleAttachBlog}
                                    disabled={attachingBlog || !selectedBlogToAdd}
                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 transition-all flex items-center shrink-0"
                                >
                                    {attachingBlog ? <Loader2 size={16} className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                                    Add Blog
                                </Button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                {attachedBlogs.length === 0 ? (
                                    <div className="p-8 text-center text-sm font-bold text-slate-400">No blogs currently featured in this journal.</div>
                                ) : (
                                    <ul className="divide-y divide-slate-100">
                                        {attachedBlogs.map(blog => (
                                            <li key={blog.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#003366]">{blog.title}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDetachBlog(blog.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shrink-0"
                                                    title="Remove from featured list"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-end space-x-4">
                            <Button
                                type="button"
                                onClick={(e) => handleSubmit(e)}
                                disabled={submitting}
                                className="bg-[#003366] hover:bg-amber-500 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#003366]/20 transition-all"
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                ) : (
                                    <Save size={16} className="mr-2" />
                                )}
                                Update Journal
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
