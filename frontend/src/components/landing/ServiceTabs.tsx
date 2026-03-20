"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Settings, AlertTriangle, Activity, Truck, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

const ICON_MAP: Record<string, React.ReactNode> = {
    'Wrench': <Wrench size={20} />,
    'Settings': <Settings size={20} />,
    'AlertTriangle': <AlertTriangle size={20} />,
    'Activity': <Activity size={20} />,
    'Truck': <Truck size={20} />
};

export default function ServiceTabs() {
    const [services, setServices] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/services').then(res => {
            const data = res.data.services || [];
            setServices(data);
            if (data.length > 0) setActiveTab(data[0].id);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return null;
    if (services.length === 0) return null;

    const activeService = services.find(s => s.id === activeTab) || services[0];

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center">
                        <span className="w-8 h-[1px] bg-red-600 mr-3" />A CARING TRADITION<span className="w-8 h-[1px] bg-red-600 ml-3" />
                    </h6>
                    <h2 className="text-4xl md:text-5xl font-black text-[#003366] leading-tight uppercase tracking-tighter">Explore Our Services</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-0 shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-100">
                    <div className="lg:w-1/3 bg-slate-50 border-r border-slate-100">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => setActiveTab(service.id)}
                                className={`w-full text-left px-8 py-5 border-b border-slate-100 flex items-center transition-all relative ${activeTab === service.id ? "bg-red-600 text-white shadow-lg z-10" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                                <span className={`mr-4 ${activeTab === service.id ? "text-white" : "text-red-600"}`}>{ICON_MAP[service.icon] || <Wrench size={20} />}</span>
                                <span className="font-black text-xs uppercase tracking-widest">{service.title}</span>
                                {activeTab === service.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-red-600 rotate-45 hidden lg:block" />}
                            </button>
                        ))}
                    </div>

                    <div className="lg:w-2/3 p-4 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeService.id} 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -20 }} 
                                transition={{ duration: 0.3 }} 
                                className="flex flex-col md:flex-row gap-10 min-h-[400px]"
                            >
                                <div className="md:w-1/2 rounded-xl overflow-hidden shadow-lg border-4 border-slate-50 relative aspect-video md:aspect-auto">
                                    {activeService.image ? (
                                        <img 
                                            src={activeService.image.startsWith('http') ? activeService.image : (activeService.image.startsWith('storage') ? `${ASSET_URL}/${activeService.image}` : `${ASSET_URL}/storage/${activeService.image}`)} 
                                            alt={activeService.title} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <Wrench size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="md:w-1/2 flex flex-col justify-center">
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">{activeService.title}</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium italic">{activeService.description}</p>
                                    <div className="grid grid-cols-1 gap-3 mb-10">
                                        {(activeService.points || []).map((point: string, idx: number) => (
                                            <div key={idx} className="flex items-center text-slate-700">
                                                <ChevronRight size={14} className="text-red-600 mr-2" />
                                                <span className="text-xs font-bold uppercase tracking-wide">{point}</span>
                                            </div>
                                        )) || (
                                            <div className="flex items-center text-slate-700">
                                                <ChevronRight size={14} className="text-red-600 mr-2" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Professional Grade Service</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href="/services" className="inline-flex bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded text-[10px] uppercase tracking-widest w-max transition-all shadow-xl shadow-red-600/20">
                                        VIEW ALL SERVICES <ArrowRight size={14} className="ml-2" />
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
