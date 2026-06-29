"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Users, ChevronRight, Trash2, Star, Square, CheckSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MySwal from "@/lib/swal";
import { useApiFetch } from "@/hooks/useApiFetch";
import { formatCurrency } from "@/lib/utils";
import { SWEETALERT_CONFIRM_OPTIONS } from "@/lib/constants";
import {
    AdminPageHeader, AdminLoading, AdminEmpty,
    BulkActionsBar, ViewModeToggle, SelectAllButton, SelectionCheckbox, FilterControls
} from "@/components/admin/shared";
import { Client } from "@/types";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "a-z", label: "Name (A-Z)" },
    { value: "spent", label: "Highest Spenders" },
];

export default function AdminClientsPage() {
    const router = useRouter();
    const { data: clients, loading, refetch } = useApiFetch<any[]>("/admin/clients");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterTier, setFilterTier] = useState('all');
    const { toast } = useToast();

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Client?',
            text: "This action will permanently remove the client and their data.",
            icon: 'warning',
            showCancelButton: true,
            ...SWEETALERT_CONFIRM_OPTIONS,
            confirmButtonText: 'Yes, delete it!'
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete(`/admin/clients/${id}`);
            refetch();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
            toast({ title: "Client Deleted", description: "The client record was removed." });
        } catch (err) {
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
            ...SWEETALERT_CONFIRM_OPTIONS,
            confirmButtonText: 'Yes, delete them!'
        });
        if (!result.isConfirmed) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/admin/clients/${id}`)));
            setSelectedIds([]);
            refetch();
            toast({ title: "Clients Deleted", description: "Selected clients were successfully removed." });
        } catch (err) {
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

    let filtered = (clients || []).filter(c =>
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

    const totalLifetimeValue = (clients || []).reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);
    const tiers = ['all', ...Array.from(new Set((clients || []).map(c => c.membership_tier).filter(Boolean)))];

    const tierOptions = tiers.map(t => ({ value: t as string, label: t === 'all' ? 'All Tiers' : t as string }));
    const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

    return (
        <AdminLayout>
            <AdminPageHeader
                badge="Client Directory"
                title="All Clients"
                subtitle="Manage registered users, loyalty status, and service history"
                stats={[
                    { label: "Total Clients", value: (clients || []).length },
                    { label: "Lifetime Value", value: formatCurrency(totalLifetimeValue), color: "text-green-600" },
                ]}
            />

            <FilterControls
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search clients..."
                sortOptions={SORT_OPTIONS}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                filterOptions={tierOptions}
                filterValue={filterTier}
                onFilterChange={setFilterTier}
                selectAllButton={<SelectAllButton allSelected={allSelected} onSelectAll={selectAll} />}
                viewModeToggle={<ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />}
            />

            <BulkActionsBar
                count={selectedIds.length}
                label="Clients"
                onDelete={handleBulkDelete}
                onCancel={() => setSelectedIds([])}
            />

            {loading ? (
                <AdminLoading message="Loading directory..." />
            ) : filtered.length === 0 ? (
                <AdminEmpty icon={<Users size={32} className="text-slate-300" />} message="No Clients Found" />
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {filtered.map(c => (
                        <div
                            key={c.id}
                            onClick={() => router.push(`/admin/clients/${c.id}/history`)}
                            className={`bg-white rounded-3xl border transition-all duration-300 relative group overflow-hidden cursor-pointer ${selectedIds.includes(c.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}
                        >
                            <div className="absolute top-4 left-4 z-10 text-slate-400" onClick={(e) => toggleSelection(c.id, e)}>
                                <SelectionCheckbox selected={selectedIds.includes(c.id)} showOnHover />
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
                                        <SelectAllButton allSelected={allSelected} onSelectAll={selectAll} />
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
                                                <SelectionCheckbox selected={selectedIds.includes(c.id)} />
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
