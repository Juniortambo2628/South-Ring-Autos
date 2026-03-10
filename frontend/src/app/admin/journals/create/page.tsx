"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Upload, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function CreateJournalPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        year: new Date().getFullYear().toString(),
        title: "",
        description: "",
        price: "",
        image: null as File | null,
        is_active: true
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent, status: "draft" | "published") => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append("year", formData.year);
            submitData.append("title", formData.title);
            submitData.append("description", formData.description);
            submitData.append("price", formData.price);
            submitData.append("is_active", formData.is_active ? "1" : "0");

            if (formData.image) {
                submitData.append("cover_image", formData.image);
            }

            await api.post("/admin/journals", submitData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast({ title: "Journal Created", description: `Journal successfully saved as ${status}.` });
            router.push("/admin/journals");
        } catch (err: any) {
            console.error("Failed to create journal", err);
            toast({ variant: "destructive", title: "Creation Failed", description: err.response?.data?.message || "Could not save the journal." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-24">
                <div className="flex items-center space-x-4 mb-8">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#003366] hover:border-[#003366] transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100">Journal Creation</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">New Journal Entry</h2>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <form onSubmit={(e) => handleSubmit(e, "published")} className="p-8 lg:p-12 space-y-10">
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

                        {/* Actions */}
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-end space-x-4">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#003366] hover:bg-amber-500 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#003366]/20 transition-all"
                            >
                                {submitting ? (
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                ) : (
                                    <Upload size={16} className="mr-2" />
                                )}
                                Save Journal
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
