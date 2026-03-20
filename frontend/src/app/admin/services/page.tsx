"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Plus, Search, Edit2, Trash2,
    CheckCircle2, AlertCircle, Loader2, Wrench,
    Grid, List as ListIcon, CheckSquare, Square,
    Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";

export default function AdminServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ title: "", description: "", icon: "Wrench", image: "" });
    const [editData, setEditData] = useState({ id: 0, title: "", description: "", icon: "Wrench", image: "" });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await api.get("/services");
            setServices(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/services", formData);
            setIsAddModalOpen(false);
            setFormData({ title: "", description: "", icon: "Wrench", image: "" });
            fetchServices();
            MySwal.fire('Added!', 'Service has been created.', 'success');
        } catch (err) {
            console.error("Failed to add service", err);
            MySwal.fire('Error', 'Failed to add service.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.patch(`/services/${editData.id}`, {
                title: editData.title,
                description: editData.description,
                icon: editData.icon,
                image: editData.image
            });
            setIsEditModalOpen(false);
            fetchServices();
            MySwal.fire('Updated!', 'Service details saved.', 'success');
        } catch (err) {
            console.error("Failed to update service", err);
            MySwal.fire('Error', 'Failed to update service.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (service: any) => {
        setEditData({
            id: service.id,
            title: service.title,
            description: service.description,
            icon: service.icon || "Wrench",
            image: service.image || ""
        });
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this service deletion!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/services/${id}`);
            fetchServices();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            MySwal.fire('Deleted!', 'Service has been deleted.', 'success');
        } catch (err) {
            console.error("Failed to delete service", err);
            MySwal.fire('Error', 'Failed to delete service.', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Services?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/services/${id}`)));
            setSelectedIds([]);
            fetchServices();
            MySwal.fire('Deleted!', 'Selected services have been deleted.', 'success');
        } catch (err) {
            console.error("Failed to delete services", err);
            MySwal.fire('Error', 'Failed to delete some services.', 'error');
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredServices.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredServices.map(s => s.id));
        }
    };

    let filteredServices = services.filter(s =>
        (s.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    filteredServices = filteredServices.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOrder === 'a-z') return (a.title || "").localeCompare(b.title || "");
        return 0;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Service Inventory</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">System Services</h2>
                    <p className="text-slate-500 font-medium italic">Manage the technical offerings and repair categories</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center space-x-3">
                            <Plus size={18} />
                            <span>Add New Service</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-lg">
                        <DialogHeader className="p-8 border-b border-slate-50">
                            <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight">Register Service</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddService} className="p-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-sm font-bold focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                    placeholder="e.g. Engine Overhaul"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all min-h-[140px] text-[#003366]"
                                    placeholder="Provide detailed information about the service..."
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Icon / Image</label>
                                <div className="rounded-2xl border-2 border-dashed border-slate-100 p-2">
                                    <FilePond
                                        onprocessfile={(error, file) => {
                                            if (!error) {
                                                const response = JSON.parse(file.serverId);
                                                setFormData({ ...formData, image: response.url });
                                            }
                                        }}
                                        server={{
                                            process: {
                                                url: (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api") + '/media/upload',
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : ''}`
                                                },
                                                onload: (response: any) => response,
                                            }
                                        }}
                                        name="file"
                                        labelIdle='Upload service thumbnail <span class="filepond--label-action">Browse</span>'
                                        acceptedFileTypes={['image/*']}
                                        allowMultiple={false}
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003366]">Cancel</Button>
                                <Button type="submit" disabled={submitting} className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/10 transition-all">
                                    {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : "Save Service"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full md:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                            placeholder="Search services..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a-z">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                        {selectedIds.length === filteredServices.length && filteredServices.length > 0 ? <CheckSquare size={14} className="text-red-600" /> : <Square size={14} />} Select All
                    </button>
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                            <Grid size={14} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                            <ListIcon size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Menu */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#003366] text-white rounded-2xl p-4 mb-8 flex items-center justify-between shadow-xl shadow-[#003366]/10 animate-in slide-in-from-bottom-4"
                    >
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest pl-4">
                            <span className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">{selectedIds.length}</span>
                            Services Selected
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedIds([])} className="px-6 h-10 rounded-xl hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 h-10 px-6 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Trash2 size={14} /> Delete Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>
            ) : filteredServices.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                        <Wrench size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No services found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map(service => (
                        <div key={service.id} className="relative p-8 bg-white rounded-[32px] border border-slate-50 group hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                            <div className="absolute top-4 left-4 z-10 text-slate-400 cursor-pointer" onClick={() => toggleSelection(service.id)}>
                                {selectedIds.includes(service.id) ? <CheckSquare className="text-red-600" size={20} /> : <Square size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>

                            {service.image ? (
                                <div className="w-full h-32 relative mb-6 rounded-2xl overflow-hidden border border-slate-50">
                                    <Image 
                                        src={service.image.startsWith('http') ? service.image : (service.image.startsWith('storage') ? `${ASSET_URL}/${service.image}` : `${ASSET_URL}/storage/${service.image}`)} 
                                        alt={service.title} 
                                        fill 
                                        className="object-cover" 
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-6 group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm">
                                    <Wrench size={28} />
                                </div>
                            )}
                            <h3 className="text-lg font-black uppercase tracking-tight text-[#003366] mb-2">{service.title}</h3>
                            <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest italic mb-4">Core Service</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-3 w-full">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-6 w-12 text-center">
                                        <button onClick={selectAll} className="text-slate-400 hover:text-[#003366]">
                                            {selectedIds.length === filteredServices.length && filteredServices.length > 0 ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    <th className="px-10 py-6">Service Type</th>
                                    <th className="px-10 py-6">Description / Excerpt</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredServices.map(service => (
                                    <tr key={service.id} className={`transition-colors group text-[#003366] ${selectedIds.includes(service.id) ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleSelection(service.id)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(service.id) ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-[#003366] group-hover:text-white transition-all shadow-sm">
                                                    <Wrench size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight mb-1">{service.title}</p>
                                                    <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest italic">Core Service</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 max-w-md">
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">{service.description}</p>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openEditModal(service)}
                                                    className="w-10 h-10 bg-slate-50 text-[#003366] border border-slate-100 rounded-xl flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all shadow-sm"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="w-10 h-10 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Service Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-lg">
                    <DialogHeader className="p-8 border-b border-slate-50">
                        <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight">Modify Service</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditService} className="p-8 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Service Title</label>
                            <Input
                                value={editData.title}
                                onChange={e => setEditData({ ...editData, title: e.target.value })}
                                className="bg-slate-50 border-slate-100 h-14 rounded-2xl text-sm font-bold focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea
                                value={editData.description}
                                onChange={e => setEditData({ ...editData, description: e.target.value })}
                                className="w-full bg-slate-50 border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all min-h-[140px] text-[#003366]"
                                required
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="h-14 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003366]">Cancel</Button>
                            <Button type="submit" disabled={submitting} className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/10 transition-all">
                                {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
