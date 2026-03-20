"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowRight, Calendar, User, BookOpen } from "lucide-react";

export default function FeaturedJournals({ content }: { content?: any }) {
    const [journals, setJournals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        api.get('/journals').then(res => {
            // Get top 3
            if (res.data.data) {
                setJournals(res.data.data.slice(0, 3));
            }
        }).catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || journals.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-2 block">Premium Insights</span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-6">Featured Journals</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Exclusive, in-depth technical analysis and repair case studies curated by our master technicians.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {journals.map((journal) => (
                        <div key={journal.id} className="group flex flex-col bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-300">
                            {/* Template Overlay for Landing Page */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={journal.image_url ? (journal.image_url.startsWith('http') ? journal.image_url : `${ASSET_URL}/${journal.image_url}`) : `${ASSET_URL}/images/South-ring-logos/SR-Logo-Transparent-BG.png`}
                                    alt={journal.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
                                    <div className="flex items-center space-x-2 text-white px-2">
                                        <BookOpen size={14} className="text-amber-400" />
                                        <span className="text-xs font-black tracking-widest uppercase">Vol {journal.year || new Date().getFullYear()}</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-black text-white leading-tight mb-2 line-clamp-2">{journal.title}</h3>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {journal.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider mb-6 pb-6 border-b border-slate-200">
                                    <div className="flex items-center"><Calendar size={14} className="mr-2 text-red-600" />{new Date(journal.created_at).toLocaleDateString()}</div>
                                </div>
                                <Link href={`/journal/${journal.id}`} className="group/btn flex items-center justify-center space-x-2 w-full bg-white border-2 border-slate-200 hover:border-red-600 hover:bg-red-600 hover:text-white text-slate-900 rounded-2xl py-4 font-black text-xs uppercase tracking-widest transition-all">
                                    <span>Read Journal</span>
                                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/journal" className="inline-flex items-center justify-center space-x-2 bg-[#003366] hover:bg-red-600 text-white rounded-full px-10 py-5 font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-[#003366]/20">
                        <span>View All Journals</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
