import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    Download,
    Filter,
    Search,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Wallet,
    Receipt,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ total_paid: 0, pending: 0, total_transactions: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            // Fetching stats again for summary cards
            const statsRes = await axios.get('/api/client/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Note: Since we don't have a dedicated /payments endpoint yet, 
            // we'll simulate empty for now or fetch from bookings if they contain payment info
            const bookingsRes = await axios.get('/api/client/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (statsRes.data.success) {
                setStats({
                    total_paid: statsRes.data.stats.total_spent,
                    pending: statsRes.data.stats.pending_payment,
                    total_transactions: bookingsRes.data.bookings.length
                });
            }

            // Extract payments from bookings for now (simplified)
            const simulatedPayments = bookingsRes.data.bookings
                .filter(b => b.actual_cost > 0)
                .map(b => ({
                    id: `PAY-${b.id}`,
                    date: b.updated_at,
                    service: b.service,
                    amount: b.actual_cost,
                    method: 'M-Pesa / Cash',
                    status: b.status === 'completed' ? 'completed' : 'pending',
                    reference: `SRA-${b.id.toString().padStart(6, '0')}`
                }));

            setPayments(simulatedPayments);

        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const paymentStats = [
        { label: 'Total Paid', value: `KES ${stats.total_paid.toLocaleString()}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Payment', value: `KES ${stats.pending.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Transactions', value: stats.total_transactions, icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    if (loading) {
        return (
            <ClientLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="mb-8 p-1">
                <h1 className="text-2xl font-black text-slate-900">Payment History</h1>
                <p className="text-sm text-slate-500 font-medium">Track your invoices and transactions.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {paymentStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                            <h3 className="text-xl font-black text-slate-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by service or reference..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <Download size={14} />
                        <span>Export Statement</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Service / Reference</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900">{new Date(payment.date).toLocaleDateString()}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-slate-900">{payment.service}</p>
                                            <p className="text-[10px] font-mono text-slate-500">{payment.reference}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <Wallet size={14} className="text-slate-400" />
                                                <span className="text-xs font-bold text-slate-700">{payment.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-900">KES {parseFloat(payment.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 transition-colors text-slate-400 hover:text-red-600 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Receipt size={32} />
                                        </div>
                                        <p className="text-slate-500 font-medium">No payment records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help Note */}
            <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-start space-x-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Payment Verification</h4>
                    <p className="text-sm text-blue-700 font-medium leading-relaxed">
                        Some payments may take up to 24 hours to reflect in your history. If you've made a payment that isn't showing here, please contact our support with your Transaction ID.
                    </p>
                </div>
            </div>
        </ClientLayout>
    );
};

export default Payments;
