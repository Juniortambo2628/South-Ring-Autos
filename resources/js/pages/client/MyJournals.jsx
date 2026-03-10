import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLayout from '../../layouts/ClientLayout';
import { useToast } from '../../context/ToastContext';
import { SkeletonRow } from '../../components/Skeletons';

const MyJournals = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get('/api/user/payments', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Filter only journal payments and extract journal info
                // Note: The API might need to be adjusted to return journal details directly
                // For now we'll assume the payment resource includes optional journal link
                const journalPayments = response.data.data.filter(p => p.payment_type === 'journal');
                setJournals(journalPayments);
            } catch (error) {
                console.error('Error fetching journals:', error);
                addToast('Failed to load your journals', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    return (
        <ClientLayout>
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">My <span className="text-red-600">Journals</span></h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-widest">Your unlocked premium archives</p>
                </header>

                <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center">
                            <Book size={20} className="mr-3 text-red-600" />
                            Collection Access
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Journal</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchased On</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [1, 2, 3].map(i => <SkeletonRow key={i} columns={4} />)
                                ) : journals.length > 0 ? (
                                    journals.map((payment) => (
                                        <tr key={payment.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white">
                                                        <Book size={20} />
                                                    </div>
                                                    <span className="font-black text-slate-900 uppercase text-xs tracking-tight">
                                                        {payment.journal?.title || `Journal ${payment.journal?.year || 'Edition'}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                    {payment.journal?.year || 'ARCHIVE'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-slate-500 font-bold text-xs">
                                                    {new Date(payment.paid_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    to={`/journal/${payment.journal_id}`}
                                                    className="inline-flex items-center space-x-2 text-red-600 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                                                >
                                                    <span>Open Library</span>
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                                                <p className="text-slate-400 font-bold text-sm">You haven't purchased any premium journals yet.</p>
                                                <Link to="/journal" className="inline-block mt-6 text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline">Browse Collection</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default MyJournals;
