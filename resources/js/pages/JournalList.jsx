import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const JournalList = () => {
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const response = await axios.get('/api/journals');
                // API Resource wraps data in 'data'
                if (response.data.data) {
                    setJournals(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching journals:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-slate-900 pt-32 pb-20 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Premium Archives</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">South Ring <span className="text-red-600">Journals</span></h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-bold leading-relaxed mb-10">
                            Our annual compilations of automotive wisdom, project documentation, and community stories. Curated for the true enthusiast.
                        </p>
                    </motion.div>
                </div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 skew-x-12 transform translate-x-1/2"></div>
            </section>

            {/* Journals Grid */}
            <section className="py-24 container mx-auto px-4">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse bg-slate-50 rounded-3xl h-[500px]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {journals.map((journal) => (
                            <motion.div
                                key={journal.id}
                                whileHover={{ y: -10 }}
                                className="group relative"
                            >
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl relative">
                                    {journal.cover_image ? (
                                        <img src={journal.cover_image} alt={journal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-900 text-white">
                                            <div className="text-red-600 mb-6">
                                                <BookOpen size={64} />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase mb-2">{journal.year} ANNUAL</h3>
                                            <p className="text-xs text-slate-400 font-black tracking-widest uppercase">South Ring Autos</p>
                                        </div>
                                    )}

                                    {/* Overlay Info */}
                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-900 to-transparent pt-24 text-white">
                                        <div className="flex items-center space-x-2 text-red-600 text-[10px] font-black uppercase tracking-widest mb-2">
                                            <Calendar size={12} />
                                            <span>Collection {journal.year}</span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{journal.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black text-red-600">KES {journal.price.toLocaleString()}</span>
                                            <Link
                                                to={`/journal/${journal.id}`}
                                                className="bg-white text-slate-900 p-3 rounded-full hover:bg-red-600 hover:text-white transition-all transform group-hover:scale-110 shadow-xl"
                                            >
                                                <ArrowRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 px-4">
                                    <p className="text-slate-500 font-bold text-sm leading-relaxed line-clamp-2">
                                        {journal.description || "Relive every story, repair, and automotive breakthrough from the year " + journal.year + "."}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Why Buy Section */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Legacy Access</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 uppercase tracking-tight">Support Our <span className="text-red-600 underline decoration-red-600/20">Craft</span></h2>
                            <p className="text-slate-600 font-bold leading-relaxed mb-8">
                                Managing and documenting high-performance vehicle repairs is a labor of love. By purchasing our journals, you gain lifetime access to restricted archives and support the continued sharing of automotive expertise.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { icon: Lock, text: "Unlock years of premium automotive history" },
                                    { icon: ShieldCheck, text: "High-resolution project gallery access" },
                                    { icon: BookOpen, text: "Curated content for offline reading" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-4">
                                        <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                            <item.icon size={18} />
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest text-slate-700">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-slate-900 rounded-3xl flex items-center justify-center p-12 text-white">
                                <div className="text-center">
                                    <h3 className="text-[120px] font-black leading-none text-red-600 mb-4 tracking-tighter italic">2025</h3>
                                    <p className="text-2xl font-black uppercase tracking-widest">NOW RELEASING</p>
                                    <div className="mt-8 border-t border-white/10 pt-8">
                                        <p className="text-slate-400 font-bold italic">Current Year Blogs stay FREE for all members.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default JournalList;
