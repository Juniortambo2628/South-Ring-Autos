"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Car, Loader2, User, Calendar,
    Grid, List as ListIcon, CheckSquare, Square, Trash2, Fuel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AdminVehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // New Features
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z' | 'year'>('newest');
    const [filterFuel, setFilterFuel] = useState<string>('all');
    const { toast } = useToast();

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/vehicles");
            setVehicles(res.data.data || []);
        } catch (err) { console.error("Failed to fetch vehicles", err); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Vehicle?',
            text: "This action will permanently remove the vehicle from the registry.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/vehicles/${id}`);
            fetchVehicles();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            toast({ title: "Vehicle Deleted", description: "The vehicle record was removed." });
        } catch (err) {
            console.error("Failed to delete vehicle", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete vehicle." });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Vehicles?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/vehicles/${id}`)));
            setSelectedIds([]);
            fetchVehicles();
            toast({ title: "Vehicles Deleted", description: "Selected vehicles were successfully removed." });
        } catch (err) {
            console.error("Failed to delete vehicles", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete some vehicles." });
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
            setSelectedIds(filtered.map(v => v.id));
        }
    };

    let filtered = vehicles.filter(v =>
        (v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.registration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.owner?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterFuel === 'all' || (v.fuel_type || "").toLowerCase() === filterFuel.toLowerCase())
    );

    filtered = filtered.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOrder === 'a-z') return (a.make || "").localeCompare(b.make || "");
        if (sortOrder === 'year') return parseInt(b.year || "0") - parseInt(a.year || "0");
        return 0;
    });

    const uniqueFuelTypes = ['all', ...Array.from(new Set(vehicles.map(v => v.fuel_type).filter(Boolean)))];

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-100">Fleet Registry</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">All Vehicles</h2>
                    <p className="text-slate-500 font-medium italic">View all registered client vehicles across the system</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[100px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fleet</p>
                    <p className="text-2xl font-black text-[#003366]">{vehicles.length}</p>
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
                            placeholder="Make, model, reg, owner..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filterFuel}
                            onChange={e => setFilterFuel(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            {uniqueFuelTypes.map(ft => (
                                <option key={ft as string} value={ft as string}>{ft === 'all' ? 'All Fuel Types' : (ft as string).charAt(0).toUpperCase() + (ft as string).slice(1).toLowerCase()}</option>
                            ))}
                        </select>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a-z">Make (A-Z)</option>
                            <option value="year">Year (Newest)</option>
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
                            Vehicles Selected
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading registry...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Car size={32} className="text-slate-300 mb-4" />
                    <p className="text-sm font-black text-[#003366] uppercase tracking-widest">No Vehicles Found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {filtered.map(v => (
                        <div key={v.id} className={`bg-white rounded-3xl border transition-all duration-300 relative group p-6 overflow-hidden ${selectedIds.includes(v.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                            {/* Card Selection */}
                            <div className="absolute top-4 left-4 z-10 text-slate-400 cursor-pointer" onClick={(e) => toggleSelection(v.id, e)}>
                                {selectedIds.includes(v.id) ? <CheckSquare className="text-red-600" size={20} /> : <Square size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>

                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={(e) => handleDelete(v.id, e)}
                                    className="w-8 h-8 bg-slate-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-slate-100 hover:border-red-600 shadow-sm"
                                    title="Delete Vehicle"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center mt-6 mb-4">
                                <div className="w-16 h-16 bg-[#003366]/5 rounded-2xl flex items-center justify-center border border-[#003366]/10 mb-4 text-[#003366] shadow-sm transform group-hover:scale-110 transition-transform">
                                    <Car size={28} />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-[#003366]">{v.make}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 mb-2">{v.model}</p>
                                <span className="inline-block px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black font-mono text-slate-600 shadow-inner">
                                    {v.registration}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Year</span>
                                    <span className="block text-xs font-bold text-[#003366] flex items-center justify-center gap-1"><Calendar size={10} className="text-blue-500" /> {v.year || "N/A"}</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                    <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Fuel & Type</span>
                                    <span className="block text-xs font-bold text-[#003366] flex items-center justify-center gap-1"><Fuel size={10} className="text-orange-500" /> {v.fuel_type ? (v.fuel_type.charAt(0).toUpperCase() + v.fuel_type.slice(1)) : "—"}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
                                <User size={12} className="text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500">Owned by</span>
                                <span className="text-xs font-black text-[#003366]">{v.owner}</span>
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
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registration</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Year</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Owner</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                                    <th className="px-8 py-6 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((v, idx) => (
                                    <motion.tr
                                        key={v.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={`transition-colors group ${selectedIds.includes(v.id) ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={(e) => toggleSelection(v.id, e)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(v.id) ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                                                    <Car size={16} />
                                                </div>
                                                <span className="text-xs font-black text-[#003366] uppercase tracking-tight">{v.make} {v.model}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6"><span className="text-[11px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{v.registration}</span></td>
                                        <td className="px-8 py-6 text-xs font-bold text-slate-500">{v.year || "N/A"}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-black border border-slate-100 text-[#003366]">{v.owner?.charAt(0)}</div>
                                                <span className="text-xs font-bold text-slate-600">{v.owner}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {v.color || "—"} • {v.fuel_type || "—"}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => handleDelete(v.id, e)}
                                                className="w-8 h-8 bg-red-50 text-red-600 rounded-lg inline-flex items-center justify-center hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm ml-auto"
                                                title="Delete Vehicle"
                                            >
                                                <Trash2 size={12} />
                                            </button>
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
