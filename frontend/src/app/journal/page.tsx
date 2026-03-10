"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight, Lock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function JournalListPage() {
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJournals = async () => {
            try {
                const res = await api.get("/journals");
                // The API returns data wrapped in a 'data' key due to JournalResource
                setJournals(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch journals", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJournals();
    }, []);

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="Annual Automotive Journals"
                    subtitle="Exclusive compilations of expert advice, technical deep-dives, and seasonal maintenance guides."
                    breadcrumb={[{ label: "JOURNAL", href: "/journal" }]}
                />

                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="text-3xl font-black text-[#003366] mb-6 uppercase tracking-tight">Preserving Automotive Excellence</h2>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Our annual journals are professionally curated editions of our most valuable insights.
                                Each journal covers a full year of automotive expertise, maintenance breakthroughs, and technological advancements.
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className="bg-slate-50 rounded-3xl h-[500px] animate-pulse" />
                                ))}
                            </div>
                        ) : journals.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <BookOpen className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium font-black uppercase text-xs tracking-widest">No journals available yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {journals.map((journal, index) => (
                                    <motion.div
                                        key={journal.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative"
                                    >
                                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full transform transition-all duration-500 hover:-translate-y-3">
                                            {/* Journal Cover - Template Overlay */}
                                            <div className="h-80 relative overflow-hidden group-hover:shadow-inner">
                                                <img
                                                    src={journal.image_url ? (journal.image_url.startsWith('http') ? journal.image_url : `${ASSET}/${journal.image_url}`) : `${ASSET}/images/placeholders/journal-cover.jpg`}
                                                    alt={journal.title}
                                                    className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/90 via-[#003366]/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                                                {/* Top Right Logo Overlay */}
                                                <div className="absolute top-6 right-6 flex flex-col items-end">
                                                    <img src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="SR Logo" className="h-6 w-auto brightness-0 invert opacity-90 mb-2" />
                                                    <span className="bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">
                                                        Vol. {journal.year || new Date().getFullYear()}
                                                    </span>
                                                </div>

                                                {/* Bottom Left Title Overlay */}
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <div className="flex items-center space-x-2 text-red-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                                                        <BookOpen size={12} />
                                                        <span>{journal.category || "Premium Edition"}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-md">{journal.title}</h3>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="p-8 flex flex-col flex-grow">
                                                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow italic">
                                                    "{journal.description || 'A comprehensive collection of our best work.'}"
                                                </p>

                                                <div className="space-y-4">
                                                    <Link
                                                        href={`/journal/${journal.id}`}
                                                        className="w-full bg-[#003366] text-white py-4 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10"
                                                    >
                                                        {journal.has_access ? (
                                                            <>Read Journal <BookOpen size={14} className="ml-2" /></>
                                                        ) : (
                                                            <>View Journal Details <ArrowRight size={14} className="ml-2" /></>
                                                        )}
                                                    </Link>

                                                    {!journal.has_access && (
                                                        <Link href={`/journal/${journal.id}`} className="w-full border-2 border-red-600 text-red-600 py-4 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                                            <ShoppingCart size={14} className="mr-2" /> Purchase Access
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
