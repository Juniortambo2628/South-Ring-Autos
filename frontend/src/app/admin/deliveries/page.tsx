"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Truck, Loader2, MapPin, Phone,
    Clock, CheckCircle2, AlertCircle, Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";

export default function AdminDeliveriesPage() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editStatus, setEditStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchDeliveries(); }, []);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/deliveries");
            setDeliveries(res.data.data || []);
        } catch (err) { console.error("Failed to fetch deliveries", err); }
        finally { setLoading(false); }
    };

    const openEdit = (d: any) => {
        setSelectedDelivery(d);
        setEditStatus(d.status);
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedDelivery) return;
        setSubmitting(true);
        try {
            await api.patch(`/admin/deliveries/${selectedDelivery.id}`, { status: editStatus });
            setIsEditOpen(false);
            fetchDeliveries();
        } catch (err) { console.error("Failed to update delivery", err); }
        finally { setSubmitting(false); }
    };

    const statusCounts = {
        all: deliveries.length,
        requested: deliveries.filter(d => d.status === "requested").length,
        scheduled: deliveries.filter(d => d.status === "scheduled").length,
        out_for_delivery: deliveries.filter(d => d.status === "out_for_delivery").length,
        completed: deliveries.filter(d => d.status === "completed").length,
    };

    const filtered = deliveries
        .filter(d => filter === "all" || d.status === filter)
        .filter(d =>
            d.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.contact_phone?.includes(searchTerm) ||
            d.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-50 text-green-600 border-green-100";
            case "out_for_delivery": return "bg-blue-50 text-blue-600 border-blue-100";
            case "scheduled": return "bg-purple-50 text-purple-600 border-purple-100";
            case "cancelled": return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-amber-50 text-amber-600 border-amber-100";
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-orange-100">Dispatch Board</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Delivery Requests</h2>
                    <p className="text-slate-500 font-medium italic">Manage vehicle pickups and drop-offs</p>
                </div>
            </div>

            {/* Status Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {(["all", "requested", "scheduled", "out_for_delivery", "completed"] as const).map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`p-4 rounded-2xl border transition-all text-left ${filter === s ? "bg-white border-red-600/30 shadow-lg" : "bg-white border-slate-100 shadow-sm hover:border-slate-200"}`}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.replace(/_/g, " ")}</p>
                        <p className="text-xl font-black text-[#003366]">{statusCounts[s]}</p>
                    </button>
                ))}
            </div>

            <div className="mb-8">
                <div className="relative group max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input type="text" placeholder="Search address, phone, client..." className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all w-full shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading deliveries...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Truck size={32} className="text-slate-300 mb-4" />
                        <p className="text-sm font-black text-[#003366] uppercase tracking-widest">No Delivery Requests</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Address</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((d, idx) => (
                                    <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${d.type === "pickup" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                                                {d.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <span className="block text-xs font-black text-[#003366]">{d.client?.name || "Guest"}</span>
                                                <span className="block text-[9px] font-bold text-slate-400 flex items-center mt-0.5"><Phone size={10} className="mr-1" /> {d.contact_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-start space-x-2 max-w-[200px]">
                                                <MapPin size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-[10px] font-bold text-slate-500 leading-relaxed">{d.address}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center text-[10px] font-bold text-slate-500">
                                                <Calendar size={12} className="mr-1.5 text-slate-400" />
                                                {d.preferred_date ? new Date(d.preferred_date).toLocaleDateString() : "TBD"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(d.status)}`}>
                                                {d.status?.replace(/_/g, " ")}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Button variant="outline" onClick={() => openEdit(d)} className="rounded-xl h-9 px-4 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-red-600 border-slate-200">
                                                Manage
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Delivery Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-md">
                    <DialogHeader className="p-8 border-b border-slate-50">
                        <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight">Update Delivery</DialogTitle>
                    </DialogHeader>
                    {selectedDelivery && (
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                        <p className="font-black text-[#003366] uppercase">{selectedDelivery.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Client</p>
                                        <p className="font-bold text-slate-600">{selectedDelivery.client?.name || "Guest"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                                        <p className="font-bold text-slate-600">{selectedDelivery.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Delivery Status</label>
                                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-[#003366] focus:ring-red-600/10 focus:border-red-600">
                                    <option value="requested">Requested</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button onClick={handleUpdate} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">
                                    {submitting ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
