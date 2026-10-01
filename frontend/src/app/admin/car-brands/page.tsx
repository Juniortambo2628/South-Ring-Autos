"use client";

import { useState, useEffect } from "react";
import {
    Loader2, Trash2, Edit2, Plus,
    CheckCircle, XCircle, Save, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MySwal from "@/lib/swal";

// FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

interface CarBrand {
    id: number;
    name: string;
    logo: string;
    sort_order: number;
    is_active: boolean;
}

function resolveLogo(logo: string): string {
    if (!logo) return "";
    if (/^https?:\/\//.test(logo)) return logo;
    if (logo.startsWith("/car-logos/")) return logo;
    if (logo.startsWith("/storage/")) return `${API_ORIGIN}${logo}`;
    return `${ASSET}${logo}`;
}

export default function AdminCarBrandsPage() {
    const [brands, setBrands] = useState<CarBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        logo: "",
        sort_order: 0,
        is_active: true
    });

    const { toast } = useToast();

    useEffect(() => { fetchBrands(); }, []);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/car-brands");
            setBrands(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch car brands", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load car brands." });
        } finally { setLoading(false); }
    };

    const handleOpenModal = (brand?: CarBrand) => {
        if (brand) {
            setEditingId(brand.id);
            setFormData({
                name: brand.name,
                logo: brand.logo,
                sort_order: brand.sort_order,
                is_active: brand.is_active === true || (brand as unknown as { is_active: number }).is_active === 1
            });
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                logo: "",
                sort_order: brands.length,
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
                await api.patch(`/admin/car-brands/${editingId}`, formData);
                toast({ title: "Updated", description: "Brand updated successfully." });
            } else {
                await api.post("/admin/car-brands", formData);
                toast({ title: "Created", description: "Brand created successfully." });
            }
            fetchBrands();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save car brand", err);
            toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Delete Brand?',
            text: "This brand will be removed from the carousel.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/car-brands/${id}`);
            fetchBrands();
            toast({ title: "Deleted", description: "Brand removed." });
        } catch (err) {
            console.error("Failed to delete car brand", err);
            toast({ variant: "destructive", title: "Error", description: "Delete failed." });
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.patch(`/admin/car-brands/${id}/toggle`);
            fetchBrands();
            toast({ title: "Status Updated" });
        } catch (err) { console.error("Failed to toggle status", err); }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Landing Page</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Car Brands</h2>
                    <p className="text-slate-500 font-medium italic">Manage the brands shown in the homepage carousel</p>
                </div>

                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center space-x-3"
                >
                    <Plus size={18} />
                    <span>Add Brand</span>
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 size={40} className="animate-spin text-red-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {brands.map((b) => (
                        <div key={b.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 flex items-center justify-center mb-4">
                                <img src={resolveLogo(b.logo)} alt={b.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-1">{b.name}</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Order {b.sort_order}</p>

                            <div className="flex items-center justify-between w-full pt-4 border-t border-slate-50">
                                <button
                                    onClick={() => toggleStatus(b.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${b.is_active ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}
                                >
                                    {b.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                    {b.is_active ? 'Active' : 'Inactive'}
                                </button>
                                <div className="flex items-center space-x-2">
                                    <Button onClick={() => handleOpenModal(b)} variant="ghost" size="icon" className="w-9 h-9 bg-slate-50 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600">
                                        <Edit2 size={14} />
                                    </Button>
                                    <Button onClick={() => handleDelete(b.id)} variant="ghost" size="icon" className="w-9 h-9 bg-red-50 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors">
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
                                        <h3 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">{editingId ? 'Edit Brand' : 'New Brand'}</h3>
                                        <p className="text-slate-400 font-medium italic text-sm">Brand name, logo and carousel order</p>
                                    </div>
                                    <button onClick={handleCloseModal} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Brand Name</label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                                placeholder="e.g. Toyota"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sort Order</label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={formData.sort_order}
                                                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value || "0", 10) })}
                                                className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logo Image</label>
                                        <div className="rounded-3xl border-2 border-dashed border-slate-100 p-2">
                                            <FilePond
                                                onprocessfile={(error, file) => {
                                                    if (!error) {
                                                        const response = JSON.parse(file.serverId);
                                                        setFormData({ ...formData, logo: response.url });
                                                    }
                                                }}
                                                server={{
                                                    process: {
                                                        url: API_URL + '/media/upload',
                                                        method: 'POST',
                                                        headers: {
                                                            'Authorization': `Bearer ${typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : ''}`
                                                        },
                                                        onload: (response: string) => response,
                                                    }
                                                }}
                                                name="file"
                                                labelIdle='Drag & Drop logo or <span class="filepond--label-action">Browse</span>'
                                                acceptedFileTypes={['image/*']}
                                                allowMultiple={false}
                                                imagePreviewHeight={100}
                                            />
                                        </div>
                                        {formData.logo && (
                                            <div className="flex items-center space-x-4 bg-slate-50 rounded-2xl px-6 py-4">
                                                <img src={resolveLogo(formData.logo)} alt="Logo preview" className="w-12 h-12 object-contain" />
                                                <span className="text-[10px] font-bold text-slate-500 break-all">{formData.logo}</span>
                                            </div>
                                        )}
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

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#003366] hover:bg-blue-900 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-900/10 flex items-center justify-center space-x-3 transition-all"
                                        >
                                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} />}
                                            <span>{editingId ? 'Save Changes' : 'Create Brand'}</span>
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
