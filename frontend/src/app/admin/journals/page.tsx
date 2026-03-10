"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, FileText, Loader2, BookOpen, Trash2, Edit2, Plus,
    Grid, List as ListIcon, CheckSquare, Square, CheckCircle, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Image from "next/image";

const MySwal = withReactContent(Swal);
const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

export default function AdminJournalsPage() {
    const router = useRouter();
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // View State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const { toast } = useToast();

    useEffect(() => { fetchJournals(); }, []);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/journals");
            setJournals(res.data.data || []);
        } catch (err) { console.error("Failed to fetch journals", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Journal?',
            text: "This action will permanently remove the journal and its contents.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/journals/${id}`);
            fetchJournals();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            toast({ title: "Journal Deleted", description: "The journal was successfully removed." });
        } catch (err) {
            console.error("Failed to delete journal", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete journal." });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Journals?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/journals/${id}`)));
            setSelectedIds([]);
            fetchJournals();
            toast({ title: "Journals Deleted", description: "Selected journals were successfully removed." });
        } catch (err) {
            console.error("Failed to delete journals", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete some journals." });
        }
    };

    const toggleStatus = async (id: number, currentIsActive: boolean, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const newStatus = !currentIsActive;

        try {
            await api.patch(`/admin/journals/${id}/status`, { is_active: newStatus });
            toast({ title: "Status Updated", description: `Journal marked as ${newStatus ? 'Active' : 'Inactive'}.` });
            fetchJournals();
        } catch (err: any) {
            console.error("Failed to update status", err);
            toast({ variant: "destructive", title: "Update Failed", description: err.response?.data?.message || "Could not update status." });
        }
    };

    const toggleSelection = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(j => j.id));
        }
    };

    let filtered = journals.filter(j =>
        (j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            j.year?.toString().includes(searchTerm.toLowerCase())) &&
        (filterStatus === 'all' || (filterStatus === 'active' && j.is_active) || (filterStatus === 'inactive' && !j.is_active))
    );

    filtered = filtered.sort((a, b) => {
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
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100">Content Management</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Journals Archive</h2>
                    <p className="text-slate-500 font-medium italic">Manage technical articles, repair guides, and premium content</p>
                </div>

                <Button
                    onClick={() => router.push('/admin/journals/create')}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/20 transition-all flex items-center space-x-3"
                >
                    <Plus size={18} />
                    <span>Create Journal</span>
                </Button>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full md:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={16} />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-none"
                            placeholder="Search title, category..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full md:w-auto min-w-[140px]"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-amber-500/20 w-full md:w-auto min-w-[140px]"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a-z">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                        {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={14} className="text-amber-500" /> : <Square size={14} />} Select All
                    </button>
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400 hover:text-[#003366]'}`}>
                            <Grid size={14} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400 hover:text-[#003366]'}`}>
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
                            Journals Selected
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedIds([])} className="px-6 h-10 rounded-xl hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleBulkDelete} className="bg-amber-500 hover:bg-amber-600 h-10 px-6 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white">
                                <Trash2 size={14} /> Delete Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading journals...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <BookOpen size={32} className="text-slate-300 mb-4" />
                    <p className="text-sm font-black text-[#003366] uppercase tracking-widest">No Journals Found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {filtered.map(j => (
                        <div
                            key={j.id}
                            className={`bg-white rounded-[32px] border transition-all duration-300 relative group overflow-hidden flex flex-col ${selectedIds.includes(j.id) ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}
                        >
                            {/* Card Selection */}
                            <div className="absolute top-4 left-4 z-10 text-slate-400 cursor-pointer bg-white/50 backdrop-blur rounded-lg w-8 h-8 flex items-center justify-center" onClick={(e) => toggleSelection(j.id, e)}>
                                {selectedIds.includes(j.id) ? <CheckSquare className="text-amber-500" size={20} /> : <Square size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>

                            <div className="relative h-48 bg-slate-100">
                                {j.image_url ? (
                                    <Image
                                        src={j.image_url.startsWith('http') ? j.image_url : `${ASSET_URL}/${j.image_url}`}
                                        alt={j.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        {j.year}
                                    </span>
                                    <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-sm">
                                        KES {j.price}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-black uppercase tracking-tight text-[#003366] mb-2 line-clamp-2">{j.title}</h3>
                                <p className="text-xs text-slate-500 font-medium italic line-clamp-2 mb-4 flex-1">{j.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => toggleStatus(j.id, j.is_active, e)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1 ${j.is_active ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                                            title={j.is_active ? "Deactivate" : "Activate"}
                                        >
                                            {j.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {j.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => router.push(`/admin/journals/edit/${j.id}`)}
                                            className="w-8 h-8 bg-slate-50 text-[#003366] rounded-xl flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all border border-slate-100"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(j.id, e)}
                                            className="w-8 h-8 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-6 w-12 text-center">
                                        <button onClick={selectAll} className="text-slate-400 hover:text-[#003366]">
                                            {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-amber-500" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thumbnail</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Journal Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((j, idx) => (
                                    <motion.tr
                                        key={j.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`transition-colors group ${selectedIds.includes(j.id) ? 'bg-amber-50/20' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={(e) => toggleSelection(j.id, e)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(j.id) ? <CheckSquare size={16} className="text-amber-500" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-slate-100 bg-slate-50 flex items-center justify-center">
                                                {j.image_url ? (
                                                    <Image src={j.image_url.startsWith('http') ? j.image_url : `${ASSET_URL}/${j.image_url}`} alt={j.title} fill className="object-cover" />
                                                ) : <FileText className="text-slate-300" />}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-sm">
                                            <h4 className="text-sm font-black uppercase tracking-tight text-[#003366] mb-1 line-clamp-1">{j.title}</h4>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{j.year} • {new Date(j.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={(e) => toggleStatus(j.id, j.is_active, e)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1 ${j.is_active ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'}`}
                                            >
                                                {j.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {j.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 max-w-min whitespace-nowrap">
                                                KES {j.price}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => router.push(`/admin/journals/edit/${j.id}`)}
                                                    className="w-10 h-10 bg-slate-50 text-[#003366] rounded-xl flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all border border-slate-100 shadow-sm"
                                                    title="Edit Journal"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(j.id, e)}
                                                    className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100 opacity-0 group-hover:opacity-100 shadow-sm"
                                                    title="Delete Journal"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
