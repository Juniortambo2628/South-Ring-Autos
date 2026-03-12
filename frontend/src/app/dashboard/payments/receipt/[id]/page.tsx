"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceipt();
    }, []);

    const fetchReceipt = async () => {
        try {
            const res = await api.get(`/payments/${params.id}/receipt`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load receipt", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 font-bold">Receipt not found</p>
            </div>
        );
    }

    const { payment, company } = data;

    return (
        <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
            {/* Action bar */}
            <div className="max-w-2xl mx-auto px-4 mb-6 print:hidden flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/payments")}
                    className="rounded-xl"
                    aria-label="Back to payments"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <Button
                    onClick={() => window.print()}
                    className="bg-[#003366] hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px]"
                >
                    <Printer size={14} className="mr-2" />
                    Print Receipt
                </Button>
            </div>

            {/* Receipt card */}
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#003366] to-[#001a33] text-white p-10 print:bg-[#003366]">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">
                                {company?.company_name || "South Ring Autos"}
                            </h1>
                            <p className="text-blue-200 text-xs mt-2 font-medium">
                                {company?.company_address || "Nairobi, Kenya"}
                            </p>
                            {company?.company_phone && (
                                <p className="text-blue-200 text-xs font-medium">{company.company_phone}</p>
                            )}
                            {company?.company_email && (
                                <p className="text-blue-200 text-xs font-medium">{company.company_email}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full mb-2">
                                <CheckCircle2 size={14} className="mr-2 text-green-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-200">Paid</span>
                            </div>
                            <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-2">
                                {payment.invoice_number}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-10">
                    <h2 className="text-lg font-black text-[#003366] uppercase tracking-tight mb-8">Payment Receipt</h2>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Date Paid</p>
                            <p className="text-sm font-bold text-[#003366]">
                                {payment.paid_at
                                    ? new Date(payment.paid_at).toLocaleString()
                                    : new Date(payment.updated_at).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</p>
                            <p className="text-sm font-bold text-[#003366] uppercase">{payment.payment_method || "Paystack"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Reference</p>
                            <p className="text-sm font-bold text-[#003366]">{payment.transaction_reference || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Client</p>
                            <p className="text-sm font-bold text-[#003366]">{payment.user?.name || "—"}</p>
                            <p className="text-xs text-slate-400">{payment.user?.email}</p>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-10 print:border-slate-300">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t border-slate-100">
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-[#003366]">
                                            {payment.booking?.service || "Vehicle Service"}
                                        </p>
                                        {payment.booking?.registration && (
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Vehicle: {payment.booking.registration}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-sm font-black text-[#003366]">
                                            {formatCurrency(parseFloat(payment.amount))}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-[#003366]/10 bg-slate-50">
                                    <th className="px-6 py-5 text-sm font-black text-[#003366] uppercase">Total</th>
                                    <th className="px-6 py-5 text-right text-lg font-black text-red-600">
                                        {formatCurrency(parseFloat(payment.amount))}
                                    </th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer note */}
                    <div className="text-center border-t border-slate-100 pt-8">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Thank you for choosing {company?.company_name || "South Ring Autos"}
                        </p>
                        <p className="text-[9px] text-slate-300 mt-2">
                            This receipt was generated electronically and is valid without a signature.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
