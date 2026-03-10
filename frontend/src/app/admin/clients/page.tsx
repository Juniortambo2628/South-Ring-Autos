"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Users, Loader2, Star, Car, Calendar,
    CreditCard, ChevronRight, Grid, List as ListIcon,
    CheckSquare, Square, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AdminClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // New Features
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z' | 'spent'>('newest');
    const [filterTier, setFilterTier] = useState<string>('all');
    const { toast } = useToast();

    useEffect(() => { fetchClients(); }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/clients");
            setClients(res.data.data || []);
        } catch (err) { console.error("Failed to fetch clients", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Client?',
            text: "This action will permanently remove the client and their data.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/clients/${id}`);
            fetchClients();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            toast({ title: "Client Deleted", description: "The client record was removed." });
        } catch (err) {
            console.error("Failed to delete client", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete client." });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Clients?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/clients/${id}`)));
            setSelectedIds([]);
            fetchClients();
            toast({ title: "Clients Deleted", description: "Selected clients were successfully removed." });
        } catch (err) {
            console.error("Failed to delete clients", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete some clients." });
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
            setSelectedIds(filtered.map(c => c.id));
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);

    let filtered = clients.filter(c =>
        (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterTier === 'all' || (c.membership_tier || "").toLowerCase() === filterTier.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOrder === 'a-z') return (a.name || "").localeCompare(b.name || "");
        if (sortOrder === 'spent') return parseFloat(b.total_spent || 0) - parseFloat(a.total_spent || 0);
        return 0;
    });

    const totalLifetimeValue = clients.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);
    const tiers = ['all', ...Array.from(new Set(clients.map(c => c.membership_tier).filter(Boolean)))];

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-purple-100">Client Directory</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">All Clients</h2>
                    <p className="text-slate-500 font-medium italic">Manage registered users, loyalty status, and service history</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[120px] flex-shrink-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Clients</p>
                        <p className="text-2xl font-black text-[#003366]">{clients.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[140px] flex-shrink-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Value</p>
                        <p className="text-lg font-black text-green-600 truncate max-w-[140px]">{formatCurrency(totalLifetimeValue)}</p>
                    </div>
                </div>
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
                            placeholder="Search clients..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filterTier}
                            onChange={e => setFilterTier(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto min-w-[140px]"
                        >
                            {tiers.map(tier => (
                                <option key={tier as string} value={tier as string}>{tier === 'all' ? 'All Tiers' : tier}</option>
                            ))}
                        </select>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto min-w-[140px]"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a-z">Name (A-Z)</option>
                            <option value="spent">Highest Spenders</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                        {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={14} className="text-red-600" /> : <Square size={14} />} Select All
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
                            Clients Selected
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
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading directory...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Users size={32} className="text-slate-300 mb-4" />
                    <p className="text-sm font-black text-[#003366] uppercase tracking-widest">No Clients Found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            onClick={() => router.push(`/admin/clients/${c.id}/history`)}
                            className={`bg-white rounded-3xl border transition-all duration-300 relative group overflow-hidden cursor-pointer ${selectedIds.includes(c.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}
                        >
                            {/* Card Selection */}
                            <div className="absolute top-4 left-4 z-10 text-slate-400" onClick={(e) => toggleSelection(c.id, e)}>
                                {selectedIds.includes(c.id) ? <CheckSquare className="text-red-600" size={20} /> : <Square size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>

                            <div className="absolute top-4 right-4 z-10 flex space-x-2">
                                <button
                                    onClick={(e) => handleDelete(c.id, e)}
                                    className="w-8 h-8 bg-white/80 backdrop-blur text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                    title="Delete Client"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>

                            <div className="p-8 flex flex-col items-center text-center mt-4">
                                <div className="w-20 h-20 bg-[#003366]/5 rounded-[24px] flex items-center justify-center text-[#003366] font-black text-3xl border border-[#003366]/10 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    {c.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-[#003366] mb-1">{c.name}</h3>
                                <div className="flex items-center space-x-2 mb-4 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    <Star size={10} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[9px] font-black text-[#003366] uppercase tracking-widest">{c.membership_tier || "Member"}</span>
                                    <span className="text-[9px] font-bold text-slate-400 border-l border-slate-200 pl-2">{c.loyalty_points || 0} pts</span>
                                </div>

                                <div className="w-full bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 flex flex-col gap-2 text-left">
                                    <span className="block text-[10px] font-bold text-slate-500 truncate"><span className="text-red-600 mr-2">@</span> {c.email}</span>
                                    <span className="block text-[10px] font-bold text-slate-500"><span className="text-red-600 mr-2">#</span> {c.phone || "No Phone"}</span>
                                </div>

                                <div className="flex w-full items-center justify-between pt-2 border-t border-slate-50">
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Value</p>
                                        <p className="text-xs font-black text-green-600">{formatCurrency(parseFloat(c.total_spent || 0))}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-red-600 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
                                            {selectedIds.length === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tier</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bookings</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicles</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Spent</th>
                                    <th className="px-8 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((c, idx) => (
                                    <motion.tr
                                        key={c.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`transition-colors group cursor-pointer ${selectedIds.includes(c.id) ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}
                                        onClick={() => router.push(`/admin/clients/${c.id}/history`)}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={(e) => toggleSelection(c.id, e)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(c.id) ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-xs font-black text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                                                    {c.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-black text-[#003366] uppercase tracking-tight">{c.name}</span>
                                                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">Since {new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-500 truncate max-w-[150px]">{c.email}</span>
                                                <span className="block text-[9px] font-bold text-slate-400 mt-0.5">{c.phone || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                                <span className="text-[9px] font-black text-[#003366] uppercase tracking-widest">{c.membership_tier || "Member"}</span>
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-400 ml-5 block mt-0.5">{c.loyalty_points || 0} pts</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 mx-auto">
                                                {c.bookings_count}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 mx-auto">
                                                {c.vehicles_count}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-green-600">{formatCurrency(parseFloat(c.total_spent || 0))}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={(e) => handleDelete(c.id, e)}
                                                    className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                    title="Delete Client"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                                <ChevronRight size={16} className="text-red-600 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
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
