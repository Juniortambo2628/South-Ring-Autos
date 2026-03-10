"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Edit2, Trash2, CheckCircle2,
    XCircle, Clock, Calendar, User, Phone, Car,
    ChevronLeft, ChevronRight, Loader2, Filter, Activity,
    Grid, List as ListIcon, CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { Booking } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");

    // Granular Loading States
    const [isUpdating, setIsUpdating] = useState<Record<number, boolean>>({});
    const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
    const { toast } = useToast();

    // New Data View States
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'date-asc' | 'date-desc'>('newest');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await api.get("/bookings");
            setBookings(response.data.data || []);
        } catch (err: any) {
            console.error("Failed to fetch bookings", err);
            toast({
                variant: 'destructive',
                title: 'Error loading bookings',
                description: err.response?.data?.message || 'Could not fetch the appointments from the server.',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        setIsUpdating(prev => ({ ...prev, [id]: true }));
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            toast({
                title: 'Status Updated',
                description: `Booking successfully marked as ${status}.`,
            });
            fetchBookings();
        } catch (err: any) {
            console.error("Failed to update status", err);
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: err.response?.data?.message || 'There was an error updating the booking status.',
            });
        } finally {
            setIsUpdating(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Delete Booking?',
            text: "Are you sure you want to delete this booking?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsDeleting(prev => ({ ...prev, [id]: true }));
        try {
            await api.delete(`/bookings/${id}`);
            toast({
                title: 'Booking Deleted',
                description: 'The appointment was permanently removed.',
            });
            fetchBookings();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
        } catch (err: any) {
            console.error("Failed to delete booking", err);
            toast({
                variant: 'destructive',
                title: 'Deletion failed',
                description: err.response?.data?.message || 'Could not delete the booking.',
            });
        } finally {
            setIsDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Bookings?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/bookings/${id}`)));
            setSelectedIds([]);
            fetchBookings();
            MySwal.fire('Deleted!', 'Selected bookings have been deleted.', 'success');
        } catch (err) {
            console.error("Failed to delete bookings", err);
            MySwal.fire('Error', 'Failed to delete some bookings.', 'error');
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredBookings.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredBookings.map(b => b.id));
        }
    };

    // Progress Update State
    const [isProgressOpen, setIsProgressOpen] = useState(false);
    const [progressBookingId, setProgressBookingId] = useState<number | null>(null);
    const [progressStage, setProgressStage] = useState("Received");
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [progressNotes, setProgressNotes] = useState("");
    const [progressSubmitting, setProgressSubmitting] = useState(false);

    const STAGES = ["Received", "Diagnostics", "Parts Sourcing", "Repairing", "QA Testing", "Ready"];
    const STAGE_PERCENTAGES: Record<string, number> = { Received: 10, Diagnostics: 25, "Parts Sourcing": 45, Repairing: 65, "QA Testing": 85, Ready: 100 };

    const openProgressModal = (bookingId: number) => {
        setProgressBookingId(bookingId);
        setProgressStage("Received");
        setProgressPercentage(10);
        setProgressNotes("");
        setIsProgressOpen(true);
    };

    const handleProgressUpdate = async () => {
        if (!progressBookingId) return;
        setProgressSubmitting(true);
        try {
            await api.post(`/admin/bookings/${progressBookingId}/progress`, {
                stage: progressStage,
                progress_percentage: progressPercentage,
                description: progressNotes || null,
            });
            setIsProgressOpen(false);
            toast({
                title: 'Progress Updated',
                description: 'The repair stage was successfully updated.',
            });
            fetchBookings();
        } catch (err: any) {
            console.error("Failed to update progress", err);
            toast({
                variant: 'destructive',
                title: 'Update failed',
                description: err.response?.data?.errors?.progress_percentage?.[0] || err.response?.data?.message || 'Could not save the repair progress update.',
            });
        } finally {
            setProgressSubmitting(false);
        }
    };

    let filteredBookings = bookings.filter(b => {
        const matchesSearch =
            (b.registration?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (b.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || b.status === filter;
        return matchesSearch && matchesFilter;
    });

    filteredBookings = filteredBookings.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        const dateA = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;

        if (sortOrder === 'date-asc') return dateA - dateB;
        if (sortOrder === 'date-desc') return dateB - dateA;

        return 0;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Booking Management</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Service Appointments</h2>
                    <p className="text-slate-500 font-medium italic">Monitor and manage all customer repair schedules</p>
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
                            placeholder="Search reg no. or name..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            <option value="newest">Created: Newest</option>
                            <option value="oldest">Created: Oldest</option>
                            <option value="date-asc">Appt Date: Soonest</option>
                            <option value="date-desc">Appt Date: Latest</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                        {selectedIds.length === filteredBookings.length && filteredBookings.length > 0 ? <CheckSquare size={14} className="text-red-600" /> : <Square size={14} />} Select All
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
                            Bookings Selected
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
            ) : filteredBookings.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                        <Calendar size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching bookings found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredBookings.map(booking => (
                        <div key={booking.id} className={`bg-white rounded-3xl border transition-all duration-300 relative group overflow-hidden ${selectedIds.includes(booking.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                            {/* Card Selection */}
                            <div className="absolute top-4 left-4 z-10 text-slate-400 cursor-pointer" onClick={() => toggleSelection(booking.id)}>
                                {selectedIds.includes(booking.id) ? <CheckSquare className="text-red-600" size={20} /> : <Square size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </div>

                            <div className="p-6 pt-12">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#003366]/5 flex items-center justify-center text-[#003366] font-black text-xs border border-[#003366]/10">
                                            {booking.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="font-black text-sm uppercase tracking-tight block text-[#003366]">{booking.name}</span>
                                            <span className="flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                <Phone size={10} className="text-red-600 mr-1" /> {booking.phone}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-dashed ${booking.status === "confirmed" ? "bg-green-50 text-green-600 border-green-200" :
                                        booking.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                            "bg-red-50 text-red-600 border-red-200"
                                        }`}>{booking.status}</span>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tighter font-mono text-[#003366]">{booking.registration}</p>
                                            <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.2em] mt-0.5">{booking.service}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-200 w-full mb-3" />
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <div className="flex items-center text-slate-600">
                                            <Calendar size={12} className="mr-2 text-red-600" />
                                            {booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}
                                        </div>
                                        <div className="flex items-center text-slate-400">
                                            <Clock size={12} className="mr-2" />
                                            Morning
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-50 mt-4">
                                    <button onClick={() => openProgressModal(booking.id)} className="flex-1 h-9 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm text-[10px] font-black uppercase tracking-widest">
                                        <Activity size={12} className="mr-2" /> Status
                                    </button>

                                    <div className="flex gap-2">
                                        {booking.status === "pending" && (
                                            <button onClick={() => updateStatus(booking.id, "confirmed")} disabled={isUpdating[booking.id]} className="w-9 h-9 bg-green-50 text-green-600 border border-green-100 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white disabled:opacity-50 transition-all shadow-sm" title="Confirm Booking">
                                                {isUpdating[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                            </button>
                                        )}
                                        {booking.status !== "cancelled" && (
                                            <button onClick={() => updateStatus(booking.id, "cancelled")} disabled={isUpdating[booking.id]} className="w-9 h-9 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl flex items-center justify-center hover:bg-amber-600 hover:text-white disabled:opacity-50 transition-all shadow-sm" title="Cancel Booking">
                                                {isUpdating[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(booking.id)} disabled={isDeleting[booking.id]} className="w-9 h-9 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm" title="Delete Permanent">
                                            {isDeleting[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                                            {selectedIds.length === filteredBookings.length && filteredBookings.length > 0 ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    <th className="px-10 py-6">Customer Details</th>
                                    <th className="px-10 py-6">Vehicle info</th>
                                    <th className="px-10 py-6">Appointment</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBookings.map(booking => (
                                    <tr key={booking.id} className={`transition-colors group text-[#003366] ${selectedIds.includes(booking.id) ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleSelection(booking.id)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(booking.id) ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-4 mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-[#003366]/5 flex items-center justify-center text-[#003366] font-black text-[10px] border border-[#003366]/10">{booking.name?.charAt(0)}</div>
                                                <span className="font-black text-xs uppercase tracking-tight">{booking.name}</span>
                                            </div>
                                            <div className="flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-12">
                                                <Phone size={8} className="text-red-600 mr-1" /> {booking.phone}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="text-xs font-black mb-1 uppercase tracking-tighter font-mono">{booking.registration}</p>
                                            <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.2em]">{booking.service}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center text-[10px] font-black mb-1 uppercase tracking-tight">
                                                <Calendar size={10} className="mr-2 text-red-600" /> {booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}
                                            </div>
                                            <div className="flex items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest pl-5">
                                                <Clock size={8} className="mr-1" /> Morning
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-center">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${booking.status === "confirmed" ? "bg-green-50 text-green-600 border-green-100" :
                                                    booking.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100 shadow-sm" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                                    }`}>{booking.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => openProgressModal(booking.id)} className="w-8 h-8 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Update Progress">
                                                    <Activity size={12} />
                                                </button>
                                                {booking.status === "pending" && (
                                                    <button onClick={() => updateStatus(booking.id, "confirmed")} disabled={isUpdating[booking.id]} className="w-8 h-8 bg-green-50 text-green-600 border border-green-100 rounded-lg flex items-center justify-center hover:bg-green-600 hover:text-white disabled:opacity-50 transition-all shadow-sm group/btn" title="Confirm Booking">
                                                        {isUpdating[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                    </button>
                                                )}
                                                {booking.status !== "cancelled" && (
                                                    <button onClick={() => updateStatus(booking.id, "cancelled")} disabled={isUpdating[booking.id]} className="w-8 h-8 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg flex items-center justify-center hover:bg-amber-600 hover:text-white disabled:opacity-50 transition-all shadow-sm group/btn" title="Cancel Booking">
                                                        {isUpdating[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(booking.id)} disabled={isDeleting[booking.id]} className="w-8 h-8 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm group/btn" title="Delete Permanent">
                                                    {isDeleting[booking.id] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
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

            {viewMode === 'list' && (
                <div className="p-10 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-white gap-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredBookings.length} Active Records</span>
                    <div className="flex space-x-3">
                        <Button variant="outline" disabled className="h-12 border-slate-100 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-[#003366] opacity-50 shadow-none">Prev</Button>
                        <Button variant="outline" disabled className="h-12 border-slate-100 rounded-2xl px-8 text-[10px] font-black uppercase tracking-widest text-[#003366] opacity-50 shadow-none">Next</Button>
                    </div>
                </div>
            )}

            {/* Update Progress Modal */}
            <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-md">
                    <DialogHeader className="p-8 border-b border-slate-50">
                        <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center">
                            <Activity className="mr-3 text-blue-600" size={20} /> Update Repair Progress
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Stage</label>
                            <select
                                value={progressStage}
                                onChange={e => { setProgressStage(e.target.value); setProgressPercentage(STAGE_PERCENTAGES[e.target.value] || 0); }}
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-[#003366] focus:ring-red-600/10 focus:border-red-600">
                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Completion ({progressPercentage}%)</label>
                            <input type="range" min={0} max={100} value={progressPercentage} onChange={e => setProgressPercentage(Number(e.target.value))} className="w-full accent-red-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Notes (Optional)</label>
                            <textarea
                                value={progressNotes}
                                onChange={e => setProgressNotes(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-[#003366] focus:ring-red-600/10 focus:border-red-600 resize-none h-24"
                                placeholder="e.g. Waiting for alternator belt..."
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => setIsProgressOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleProgressUpdate} disabled={progressSubmitting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">
                                {progressSubmitting ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                Publish Update
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
