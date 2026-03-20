import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, CreditCard, ArrowLeft, Bookmark, Lock, Play } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const JournalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [journal, setJournal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const fetchJournal = async () => {
            try {
                const response = await axios.get(`/api/journals/${id}`);
                // API Resource wraps data in 'data'
                if (response.data.data) {
                    setJournal(response.data.data);
                    checkAccess(response.data.data.year);
                }
            } catch (error) {
                console.error('Error fetching journal:', error);
                addToast('Failed to load journal details.', 'error');
            } finally {
                setLoading(false);
            }
        };

        const checkAccess = async (year) => {
            const token = localStorage.getItem('auth_token');
            if (!token) return;
            try {
                const res = await axios.get(`/api/journals/check/${year}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHasAccess(res.data.has_access);
            } catch (e) {
                console.error('Access check failed', e);
            }
        };

        fetchJournal();
    }, [id]);

    const handlePurchase = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            addToast('Please login to purchase.', 'info');
            navigate('/login');
            return;
        }

        setPurchasing(true);
        try {
            const response = await axios.post('/api/journals/purchase', {
                journal_id: journal.id,
                payment_method: 'card' // Mocking card payment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                addToast(response.data.message, 'success');
                setHasAccess(true);
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.values(errors).flat().forEach(msg => {
                    addToast(msg, 'error');
                });
            } else {
                addToast(error.response?.data?.message || 'Purchase failed. Please try again.', 'error');
            }
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading...</div>;
    if (!journal) return <div className="min-h-screen flex items-center justify-center underline">Journal Not Found</div>;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <Link to="/journal" className="inline-flex items-center text-slate-400 hover:text-white mb-10 uppercase text-[10px] font-black tracking-widest transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Collection
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="bg-red-600/10 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit mb-6">
                                Premium Edition
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight">{journal.title}</h1>
                            <p className="text-slate-400 text-lg font-bold leading-relaxed mb-10 max-w-xl">
                                {journal.description || `Every breakthrough, every challenge, and every victory from Nairobi's premier automotive garage in ${journal.year}. Access exclusive teardowns and project insights.`}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/5">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Price</p>
                                    <p className="text-2xl font-black text-red-600">KES {journal.price.toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-4 rounded-3xl border border-white/5">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Archive</p>
                                    <p className="text-2xl font-black">{journal.year}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                {hasAccess ? (
                                    <button className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center cursor-default">
                                        <ShieldCheck size={20} className="mr-3" /> Access Unlocked
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePurchase}
                                        disabled={purchasing}
                                        className="bg-red-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-2xl shadow-red-600/30 flex items-center active:scale-95 disabled:opacity-50"
                                    >
                                        {purchasing ? (
                                            "Processing..."
                                        ) : (
                                            <><CreditCard size={20} className="mr-3" /> Get Access Now</>
                                        )}
                                    </button>
                                )}
                                <div className="flex items-center text-slate-400 space-x-2 text-[10px] font-black uppercase tracking-widest">
                                    <Bookmark size={14} />
                                    <span>Lifetime Access</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="aspect-[3/4] bg-slate-800 rounded-[40px] shadow-2xl border-8 border-white/5 overflow-hidden relative group">
                                {journal.cover_image ? (
                                    <img src={journal.cover_image} alt={journal.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-12">
                                        <div className="text-red-600 mb-8 scale-150">
                                            <Bookmark size={64} />
                                        </div>
                                        <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">{journal.year}</h2>
                                        <p className="text-slate-500 font-bold tracking-[0.4em] uppercase text-xs">ANNUAL JOURNAL</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/0 transition-all duration-700"></div>
                            </div>

                            {/* Floating decorative elements */}
                            <div className="absolute -top-6 -right-6 bg-red-600 w-20 h-20 rounded-full flex items-center justify-center font-black animate-bounce shadow-xl">OFFER</div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 uppercase tracking-tight flex items-center">
                        <Play size={24} className="mr-4 text-red-600 fill-red-600" /> What's Included
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            "All technical blog posts from the 2024 calendar year",
                            "Detailed project breakdowns with high-res galleries",
                            "Step-by-step diagnostic workflows and solutions",
                            "Lifetime access via your South Ring Autos account",
                            "Ad-free reading experience in our protected reader",
                            "Early access to future journal releases"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start space-x-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="bg-red-100 text-red-600 p-1.5 rounded-xl mt-1">
                                    <Check size={16} />
                                </div>
                                <p className="font-bold text-slate-700 text-sm leading-relaxed">{item}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-10 bg-slate-900 rounded-[40px] text-white text-center relative overflow-hidden">
                        <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 text-white/5 opacity-10 pointer-events-none" />
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Ready to deep dive?</h3>
                        <p className="text-slate-400 font-bold mb-8 max-w-md mx-auto">Join hundreds of enthusiasts who trust South Ring Autos for technical insight and craftsmanship.</p>
                        <button
                            disabled={hasAccess || purchasing}
                            onClick={handlePurchase}
                            className="bg-white text-slate-900 px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {hasAccess ? "Content Unlocked" : (purchasing ? "Processing..." : "Purchase Access")}
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default JournalDetail;
