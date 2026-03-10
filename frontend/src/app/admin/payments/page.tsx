"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, CheckCircle2, XCircle, Clock, Loader2,
    CreditCard, FileText, Filter, ChevronRight, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editStatus, setEditStatus] = useState("");
    const [editRef, setEditRef] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchPayments(); }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/payments");
            setPayments(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch payments", err);
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (payment: any) => {
        setSelectedPayment(payment);
        setEditStatus(payment.status);
        setEditRef(payment.transaction_reference || "");
        setIsEditOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedPayment) return;
        setSubmitting(true);
        try {
            await api.patch(`/admin/payments/${selectedPayment.id}/status`, {
                status: editStatus,
                transaction_reference: editRef || null,
            });
            setIsEditOpen(false);
            fetchPayments();
        } catch (err) {
            console.error("Failed to update payment", err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);

    const statusCounts = {
        all: payments.length,
        pending: payments.filter(p => p.status === "pending").length,
        completed: payments.filter(p => p.status === "completed").length,
        failed: payments.filter(p => p.status === "failed").length,
    };

    const filteredPayments = payments
        .filter(p => filter === "all" || p.status === filter)
        .filter(p =>
            p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const totalRevenue = payments
        .filter(p => p.status === "completed")
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-green-100">Financial Centre</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Payments & Invoices</h2>
                    <p className="text-slate-500 font-medium italic">Track, verify, and manage all system transactions</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[120px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-lg font-black text-green-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {(["all", "pending", "completed", "failed"] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`p-5 rounded-2xl border transition-all text-left ${filter === s
                            ? "bg-white border-red-600/30 shadow-lg shadow-red-600/5"
                            : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                            }`}
                    >
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 capitalize">{s}</p>
                        <p className="text-2xl font-black text-[#003366]">{statusCounts[s]}</p>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative group max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices, clients, references..."
                        className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all w-full shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading payments...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <CreditCard size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">No Payments Found</h3>
                        <p className="text-xs font-bold text-slate-400">No matching transactions in the system.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPayments.map((payment, idx) => (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                                    <FileText size={16} className="text-[#003366]" />
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-black text-[#003366] uppercase tracking-tight">{payment.invoice_number}</span>
                                                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-bold text-slate-600">{payment.user?.name || "Guest"}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-[#003366]">{formatCurrency(parseFloat(payment.amount))}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{payment.payment_method}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${payment.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                                                    payment.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-red-50 text-red-600 border-red-100"
                                                }`}>
                                                {payment.status === "completed" && <CheckCircle2 size={12} className="mr-1" />}
                                                {payment.status === "pending" && <Clock size={12} className="mr-1" />}
                                                {payment.status === "failed" && <AlertCircle size={12} className="mr-1" />}
                                                {payment.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => openEdit(payment)}
                                                className="rounded-xl h-9 px-4 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-red-600 border-slate-200"
                                            >
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

            {/* Edit Payment Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-md">
                    <DialogHeader className="p-8 border-b border-slate-50">
                        <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight">Manage Payment</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoice</p>
                                        <p className="font-black text-[#003366]">{selectedPayment.invoice_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                        <p className="font-black text-[#003366]">{formatCurrency(parseFloat(selectedPayment.amount))}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Client</p>
                                        <p className="font-bold text-slate-600">{selectedPayment.user?.name || "Guest"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                                        <p className="font-bold text-slate-600 uppercase">{selectedPayment.payment_method}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Status</label>
                                <select
                                    value={editStatus}
                                    onChange={e => setEditStatus(e.target.value)}
                                    className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold text-[#003366] focus:ring-red-600/10 focus:border-red-600"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Transaction Reference</label>
                                <Input
                                    value={editRef}
                                    onChange={e => setEditRef(e.target.value)}
                                    className="bg-slate-50 border-slate-100 h-12 rounded-xl text-sm font-bold"
                                    placeholder="e.g. TRX-834291"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl">Cancel</Button>
                                <Button
                                    onClick={handleUpdateStatus}
                                    disabled={submitting}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px]"
                                >
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
