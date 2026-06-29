"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Car, Trash2, User, Calendar, Fuel } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MySwal from "@/lib/swal";
import { useApiFetch } from "@/hooks/useApiFetch";
import { SWEETALERT_CONFIRM_OPTIONS } from "@/lib/constants";
import {
    AdminPageHeader, AdminLoading, AdminEmpty,
    BulkActionsBar, ViewModeToggle, SelectAllButton, SelectionCheckbox, FilterControls
} from "@/components/admin/shared";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "a-z", label: "Make (A-Z)" },
    { value: "year", label: "Year (Newest)" },
];

export default function AdminVehiclesPage() {
    const { data: vehicles, loading, refetch } = useApiFetch<any[]>("/admin/vehicles");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterFuel, setFilterFuel] = useState('all');
    const { toast } = useToast();

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Vehicle?',
            text: "This action will permanently remove the vehicle from the registry.",
            icon: 'warning',
            showCancelButton: true,
            ...SWEETALERT_CONFIRM_OPTIONS,
            confirmButtonText: 'Yes, delete it!'
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/admin/vehicles/${id}`);
            refetch();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            toast({ title: "Vehicle Deleted", description: "The vehicle record was removed." });
        } catch (err) {
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
            ...SWEETALERT_CONFIRM_OPTIONS,
            confirmButtonText: 'Yes, delete them!'
        });
        if (!result.isConfirmed) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/vehicles/${id}`)));
            setSelectedIds([]);
            refetch();
            toast({ title: "Vehicles Deleted", description: "Selected vehicles were successfully removed." });
        } catch (err) {
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

    let filtered = (vehicles || []).filter(v =>
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

    const uniqueFuelTypes = ['all', ...Array.from(new Set((vehicles || []).map(v => v.fuel_type).filter(Boolean)))];
    const fuelOptions = uniqueFuelTypes.map(ft => ({
        value: ft as string,
        label: ft === 'all' ? 'All Fuel Types' : (ft as string).charAt(0).toUpperCase() + (ft as string).slice(1).toLowerCase()
    }));
    const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

    return (
        <AdminLayout>
            <AdminPageHeader
                badge="Fleet Registry"
                badgeColor="blue"
                title="All Vehicles"
                subtitle="View all registered client vehicles across the system"
                stats={[{ label: "Total Fleet", value: (vehicles || []).length }]}
            />

            <FilterControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Make, model, reg, owner..."
                sortOptions={SORT_OPTIONS}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                filterOptions={fuelOptions}
                filterValue={filterFuel}
                onFilterChange={setFilterFuel}
                selectAllButton={<SelectAllButton allSelected={allSelected} onSelectAll={selectAll} />}
                viewModeToggle={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
            />

            <BulkActionsBar
                count={selectedIds.length}
                label="Vehicles"
                onDelete={handleBulkDelete}
                onCancel={() => setSelectedIds([])}
            />

            {loading ? (
                <AdminLoading message="Loading registry..." />
            ) : filtered.length === 0 ? (
                <AdminEmpty icon={<Car size={32} className="text-slate-300" />} message="No Vehicles Found" />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {filtered.map(v => (
                        <div key={v.id} className={`bg-white rounded-3xl border transition-all duration-300 relative group p-6 overflow-hidden ${selectedIds.includes(v.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                            <div className="absolute top-4 left-4 z-10 text-slate-400 cursor-pointer" onClick={(e) => toggleSelection(v.id, e)}>
                                <SelectionCheckbox selected={selectedIds.includes(v.id)} showOnHover />
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
                                        <SelectAllButton allSelected={allSelected} onSelectAll={selectAll} />
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
                                                <SelectionCheckbox selected={selectedIds.includes(v.id)} />
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
