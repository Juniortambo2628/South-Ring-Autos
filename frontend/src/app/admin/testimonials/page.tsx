"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Loader2, Quote, Trash2, Edit2, Plus,
    CheckCircle, XCircle, Star, Image as ImageIcon,
    Save, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Image from "next/image";

// FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

const MySwal = withReactContent(Swal);
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

export default function AdminTestimonialsPage() {
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        content: "",
        rating: 5,
        image_url: "",
        is_active: true
    });

    const { toast } = useToast();

    useEffect(() => { fetchTestimonials(); }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/testimonials");
            setTestimonials(res.data.data || []);
        } catch (err) { 
            console.error("Failed to fetch testimonials", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load testimonials." });
        } finally { setLoading(false); }
    };

    const handleOpenModal = (testimonial?: any) => {
        if (testimonial) {
            setEditingId(testimonial.id);
            setFormData({
                name: testimonial.name,
                role: testimonial.role,
                content: testimonial.content,
                rating: testimonial.rating,
                image_url: testimonial.image_url,
                is_active: testimonial.is_active === 1 || testimonial.is_active === true
            });
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                role: "",
                content: "",
                rating: 5,
                image_url: "",
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/admin/testimonials/${editingId}`, formData);
                toast({ title: "Updated", description: "Testimonial updated successfully." });
            } else {
                await api.post("/admin/testimonials", formData);
                toast({ title: "Created", description: "Testimonial created successfully." });
            }
            fetchTestimonials();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save testimonial", err);
            toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Delete Testimonial?',
            text: "This client review will be permanently removed.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/testimonials/${id}`);
            fetchTestimonials();
            toast({ title: "Deleted", description: "Testimonial removed." });
        } catch (err) {
            console.error("Failed to delete testimonial", err);
            toast({ variant: "destructive", title: "Error", description: "Delete failed." });
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.patch(`/admin/testimonials/${id}/toggle`);
            fetchTestimonials();
            toast({ title: "Status Updated" });
        } catch (err) { console.error("Failed to toggle status", err); }
    };

    const filtered = testimonials.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Client Feedback</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Testimonials</h2>
                    <p className="text-slate-500 font-medium italic">Manage customer reviews and spotlight your best feedback</p>
                </div>

                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center space-x-3"
                >
                    <Plus size={18} />
                    <span>Add Testimonial</span>
                </Button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                    <Input
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                        placeholder="Search testimonials..."
                    />
                </div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Showing {filtered.length} Reviews
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing reviews...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                    <Quote size={48} className="text-slate-200 mb-6" />
                    <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">No Testimonials Found</h3>
                    <p className="text-sm text-slate-400 font-medium italic">Start by adding your first client success story</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {filtered.map(t => (
                        <div
                            key={t.id}
                            className="bg-white rounded-[32px] border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 relative group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-50">
                                        {t.image_url ? (
                                            <Image 
                                                src={t.image_url.startsWith('http') ? t.image_url : (t.image_url.startsWith('storage') ? `${ASSET_URL}/${t.image_url}` : `${ASSET_URL}/storage/${t.image_url}`)}
                                                alt={t.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase text-xs tracking-tight">{t.name}</h4>
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} size={10} fill={i < t.rating ? "currentColor" : "none"} className={i < t.rating ? "" : "text-slate-200"} />
                                    ))}
                                </div>
                            </div>

                            <p className="text-slate-500 text-sm italic font-medium leading-relaxed mb-8 line-clamp-4">&quot;{t.content}&quot;</p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <button
                                    onClick={() => toggleStatus(t.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${t.is_active ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                                >
                                    {t.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                    {t.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <div className="flex items-center space-x-2">
                                    <Button onClick={() => handleOpenModal(t)} variant="ghost" size="icon" className="w-9 h-9 bg-slate-50 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600">
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button onClick={() => handleDelete(t.id)} variant="ghost" size="icon" className="w-9 h-9 bg-red-50 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors">
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">{editingId ? 'Edit Review' : 'New Testimonial'}</h3>
                                        <p className="text-slate-400 font-medium italic text-sm">Fill in the details for the client spotlight</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Client Name</label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Vehicle / Role</label>
                                            <Input
                                                required
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                                placeholder="e.g. Toyota VitZ Owner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Testimonial Content</label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full bg-slate-50 border-slate-100 rounded-3xl px-6 py-5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all min-h-[140px]"
                                            placeholder="What did the client say about your service?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Rating</label>
                                            <div className="flex items-center space-x-2 bg-slate-50 h-14 rounded-2xl px-6 border border-slate-100">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={20}
                                                        className={`cursor-pointer transition-colors ${i < formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                                                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Display Status</label>
                                            <div
                                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                className={`flex items-center space-x-3 h-14 rounded-2xl px-6 border cursor-pointer transition-all ${formData.is_active ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                            >
                                                {formData.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{formData.is_active ? 'Visible on Website' : 'Hidden from Website'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Client Avatar</label>
                                        <div className="rounded-3xl border-2 border-dashed border-slate-100 p-2">
                                            <FilePond
                                                onprocessfile={(error, file) => {
                                                    if (!error) {
                                                        const response = JSON.parse(file.serverId);
                                                        setFormData({ ...formData, image_url: response.url });
                                                    }
                                                }}
                                                server={{
                                                    process: {
                                                        url: (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api") + '/media/upload',
                                                        method: 'POST',
                                                        headers: {
                                                            'Authorization': `Bearer ${typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : ''}`
                                                        },
                                                        onload: (response: any) => response,
                                                    }
                                                }}
                                                name="file"
                                                labelIdle='Drag & Drop image or <span class="filepond--label-action">Browse</span>'
                                                acceptedFileTypes={['image/*']}
                                                allowMultiple={false}
                                                imagePreviewHeight={100}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#003366] hover:bg-blue-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-900/10 flex items-center justify-center space-x-3 transition-all"
                                        >
                                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />}
                                            <span>{editingId ? 'Save Changes' : 'Publish Testimonial'}</span>
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
