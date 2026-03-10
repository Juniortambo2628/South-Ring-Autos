"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, Calendar, Clock, ChevronRight,
    CheckCircle2, AlertCircle, Search, Filter,
    FileText, Loader2, Download, Printer, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("mpesa");
    const { toast } = useToast();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get("/user/payments");
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch payments", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNowClick = (payment: any) => {
        setSelectedPayment(payment);
        setIsPaymentModalOpen(true);
    };

    const processPayment = async () => {
        if (!selectedPayment) return;
        setProcessing(true);

        try {
            // In a real application, this would trigger an M-PESA STK push or Stripe Checkout
            // Here we just mock the success immediately for demonstration
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In a real app the webhook usually updates the status, but we update manually here for the demo
            await api.patch(`/admin/payments/${selectedPayment.id}/status`, {
                status: 'completed',
                transaction_reference: `TRX-${Math.floor(Math.random() * 1000000)}`
            });

            setIsPaymentModalOpen(false);
            fetchPayments();
        } catch (err) {
            console.error("Payment failed", err);
            // Log error
            toast({
                variant: 'destructive',
                title: "Payment Error",
                description: "Payment simulation failed due to server error.",
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const filteredPayments = payments.filter(p =>
        p.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.booking?.service?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Billing & Invoices</h2>
                    <p className="text-slate-500 font-medium italic">Manage your service payments and transaction history</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading transactions...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">No Transactions Found</h3>
                        <p className="text-xs font-bold text-slate-400 mb-6 max-w-sm">You haven't made any payments or received any invoices yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Ref</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
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
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-7">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-colors">
                                                    <FileText size={20} className="text-[#003366]" />
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-black text-[#003366] uppercase tracking-tight">{payment.invoice_number}</span>
                                                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-[11px] font-black text-[#003366] uppercase tracking-widest leading-loose">
                                                    {payment.booking?.service || "Custom Service"}
                                                </span>
                                                {payment.transaction_reference && (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Ref: {payment.transaction_reference}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className="text-sm font-black text-[#003366]">{formatCurrency(parseFloat(payment.amount))}</span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${payment.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                                                payment.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-red-50 text-red-600 border-red-100"
                                                }`}>
                                                {payment.status === "completed" && <CheckCircle2 size={12} className="mr-1.5" />}
                                                {payment.status === "pending" && <Clock size={12} className="mr-1.5" />}
                                                {payment.status === "failed" && <AlertCircle size={12} className="mr-1.5" />}
                                                {payment.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            {payment.status === 'pending' ? (
                                                <Button
                                                    onClick={() => handlePayNowClick(payment)}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-600/20"
                                                >
                                                    Pay Now
                                                </Button>
                                            ) : (
                                                <Button variant="outline" className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-[#003366]">
                                                    <Download size={14} className="mr-2" /> Receipt
                                                </Button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isPaymentModalOpen && selectedPayment && (
                    <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                        <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-md">
                            <DialogHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                                <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center">
                                    <CreditCard className="mr-3 text-red-600" /> Complete Payment
                                </DialogTitle>
                            </DialogHeader>
                            <div className="p-8">
                                <div className="bg-[#003366] rounded-2xl p-6 text-white mb-8 shadow-xl shadow-blue-900/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Total Amount Due</p>
                                    <h3 className="text-4xl font-black tracking-tighter mb-4">{formatCurrency(parseFloat(selectedPayment.amount))}</h3>
                                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Invoice No.</p>
                                            <p className="text-xs font-black uppercase tracking-widest">{selectedPayment.invoice_number}</p>
                                        </div>
                                        <Zap size={20} className="text-amber-400 fill-amber-400 opacity-50" />
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Payment Method</label>

                                    <div
                                        onClick={() => setPaymentMethod('mpesa')}
                                        className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'mpesa' ? 'border-[#003366] bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <img src="/car-logos/mpesa.png" alt="M-PESA" className="w-6 h-6 object-contain" onError={(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSI+PHBhdGggZD0iTTEyIDJjNS41MjMgMCAxMCA0LjQ3NyAxMCAxMHMtNC40NzcgMTAtMTAgMTBTMCAxNy41MjMgMCAxMiA0LjQ3NyAyIDEyIDJ6IiBvcGFjaXR5PSIuMiIvPjwvc3ZnPg=='} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#003366] uppercase tracking-widest">M-PESA Express</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Instant mobile payment</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mpesa' ? 'border-[#003366]' : 'border-slate-300'}`}>
                                            {paymentMethod === 'mpesa' && <div className="w-2.5 h-2.5 bg-[#003366] rounded-full" />}
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-[#003366] bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <CreditCard size={18} className="text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#003366] uppercase tracking-widest">Credit/Debit Card</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Visa, Mastercard</p>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#003366]' : 'border-slate-300'}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-[#003366] rounded-full" />}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={processPayment}
                                    disabled={processing}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all"
                                >
                                    {processing ? (
                                        <span className="flex items-center"><Loader2 className="mr-2 animate-spin" size={16} /> Processing Transaction...</span>
                                    ) : (
                                        <span>Confirm & Pay {formatCurrency(parseFloat(selectedPayment.amount))}</span>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
