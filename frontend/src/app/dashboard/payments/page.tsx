"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PaystackButton from "@/components/dashboard/PaystackButton";
import { motion } from "framer-motion";
import {
    CreditCard, CheckCircle2, AlertCircle, Search,
    FileText, Loader2, Download, Clock, Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PaymentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Check for Paystack callback verification
        const verifyRef = searchParams.get("verify");
        if (verifyRef) {
            verifyPayment(verifyRef);
        }
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get("/user/payments");
            if (res.data.success) {
                setPayments(res.data.data);
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err.response?.data?.message || "Failed to load payments",
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyPayment = async (reference: string) => {
        setVerifying(true);
        try {
            const res = await api.get(`/payments/paystack/verify?reference=${reference}`);
            if (res.data.success) {
                toast({
                    title: "Payment Successful!",
                    description: "Your payment has been verified and processed.",
                });
            }
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Verification Issue",
                description: err.response?.data?.message || "Could not verify payment. It may still be processing.",
            });
        } finally {
            setVerifying(false);
            fetchPayments();
            // Clean URL
            window.history.replaceState({}, "", "/dashboard/payments");
        }
    };

    const handlePaymentSuccess = () => {
        toast({
            title: "Payment Successful!",
            description: "Your transaction has been completed.",
        });
        fetchPayments();
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);

    const totalPaid = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const totalPending = payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const filteredPayments = payments.filter(
        (p) =>
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
                <div className="flex items-center space-x-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[110px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-sm font-black text-green-600">{formatCurrency(totalPaid)}</p>
                    </div>
                    {totalPending > 0 && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 shadow-sm text-center min-w-[110px]">
                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Pending</p>
                            <p className="text-sm font-black text-amber-600">{formatCurrency(totalPending)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification banner */}
            {verifying && (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-4" />
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Verifying your payment...</span>
                </div>
            )}

            {/* Search */}
            <div className="mb-8">
                <div className="relative group max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all w-full shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search invoices"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" role="status" aria-label="Loading" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading transactions...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">No Transactions Found</h3>
                        <p className="text-xs font-bold text-slate-400 mb-6 max-w-sm">You haven&apos;t received any invoices yet. Invoices will appear here once your service has been quoted.</p>
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
                                            <div
                                                className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    payment.status === "completed"
                                                        ? "bg-green-50 text-green-600 border-green-100"
                                                        : payment.status === "pending"
                                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                                        : "bg-red-50 text-red-600 border-red-100"
                                                }`}
                                            >
                                                {payment.status === "completed" && <CheckCircle2 size={12} className="mr-1.5" />}
                                                {payment.status === "pending" && <Clock size={12} className="mr-1.5" />}
                                                {payment.status === "failed" && <AlertCircle size={12} className="mr-1.5" />}
                                                {payment.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center space-x-2">
                                                {payment.status === "pending" ? (
                                                    <PaystackButton
                                                        paymentId={payment.id}
                                                        amount={parseFloat(payment.amount)}
                                                        invoiceNumber={payment.invoice_number}
                                                        onSuccess={handlePaymentSuccess}
                                                    />
                                                ) : payment.status === "completed" ? (
                                                    <Link href={`/dashboard/payments/receipt/${payment.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[9px] text-slate-500 hover:text-[#003366]"
                                                            aria-label={`View receipt for ${payment.invoice_number}`}
                                                        >
                                                            <Printer size={14} className="mr-2" />
                                                            Receipt
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">—</span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
