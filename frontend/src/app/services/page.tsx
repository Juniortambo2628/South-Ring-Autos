"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { motion } from "framer-motion";
import { Wrench, Settings, AlertTriangle, Activity, Truck, ChevronRight, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

const services = [
    {
        id: "general",
        label: "General Service",
        icon: Wrench,
        title: "Quality Engine Service",
        description: "Comprehensive multi-point inspections and maintenance for all Japanese and European models. We use genuine parts to ensure longevity and MPESA-friendly quick checks for your convenience.",
        points: ["Oil & Oil Filter Change", "Full Fluid Top-up", "Air & Fuel Filter Check", "Brake System Inspection"],
        image: "/images/Car-Assessment-2.jpg"
    },
    {
        id: "engine",
        label: "Engine & Transmission",
        icon: Settings,
        title: "Mechanical Specialist",
        description: "From minor tuning to complete engine overhauls. Our transmission experts handle both automatic and manual gearbox repairs with precision and care.",
        points: ["Full Engine Overhaul", "Gearbox Restoration", "Clutch Replacement", "Performance Tuning"],
        image: "/images/Engine-repairs.jpg"
    },
    {
        id: "accident",
        label: "Accident Repair",
        icon: AlertTriangle,
        title: "Bodywork & Paint",
        description: "Professional panel beating and spray painting services. We restore your vehicle to its original factory finish after any level of impact or wear.",
        points: ["Precision Panel Beating", "High-Quality Respray", "Chassis Straightening", "Detailing & Buffing"],
        image: "/images/Car-Lift-Raised.jpg"
    },
    {
        id: "diagnostics",
        label: "Diagnostics",
        icon: Activity,
        title: "Tech-Driven Solutions",
        description: "Advanced computerised diagnostics that take the guesswork out of repairs. We identify sensory, electrical, and mechanical faults with 99% accuracy.",
        points: ["ECU Scanner Diagnostics", "Electrical Wiring Repair", "Sensor Calibration", "Full System Reset"],
        image: "/images/Car-Assessment-2.jpg"
    },
    {
        id: "specialized",
        label: "Specialized Services",
        icon: Truck,
        title: "Fleet & Luxury Care",
        description: "Customized maintenance programs for corporate fleets and specialized care for hybrid and luxury vehicles. We keep your business moving.",
        points: ["Corporate Fleet Maintenance", "Hybrid System Service", "Suspension Overhaul", "Bespoke Luxury Car Care"],
        image: "/images/Engine-block-3.jpg"
    },
    {
        id: "ac",
        label: "A/C & Cooling",
        icon: ShieldCheck,
        title: "Air Conditioning",
        description: "Keep your cabin cool and comfortable. We provide comprehensive A/C servicing, from gas refilling to compressor repairs and leak detection.",
        points: ["A/C Gas Refilling", "Leak Detection", "Compressor Repair", "Cabin Filter Replacement"],
        image: "/images/Engine-block-3.jpg"
    }
];

export default function ServicesPage() {
    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="Our Professional Services"
                    subtitle="From routine maintenance to complex mechanical repairs, we offer a full range of services to keep your vehicle in peak condition."
                    breadcrumb={[{ label: "SERVICES", href: "/services" }]}
                />

                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 transition-transform h-full"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={`${ASSET}${service.image}`} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-xl shadow-lg">
                                            <service.icon size={24} />
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <h3 className="text-xl font-black text-[#003366] mb-4 uppercase tracking-tight">{service.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow">{service.description}</p>

                                        <div className="space-y-3 mb-10">
                                            {service.points.map((point) => (
                                                <div key={point} className="flex items-center space-x-2">
                                                    <CheckCircle2 size={16} className="text-red-600" />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{point}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Link href="/booking" className="inline-flex items-center text-red-600 font-black text-[10px] uppercase tracking-[0.2em] group">
                                            Book This Service <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ/Trust Section */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4 text-center max-w-4xl">
                        <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center justify-center">
                            <span className="w-8 h-[2px] bg-red-600 mr-3" />TECHNICAL EXCELLENCE<span className="w-8 h-[2px] bg-red-600 ml-3" />
                        </h6>
                        <h2 className="text-4xl md:text-5xl font-black text-[#003366] mb-8 leading-tight uppercase">Need a quick diagnosis?</h2>
                        <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium">
                            Stop guessing. Bring your car in for a comprehensive scan. We use the latest diagnostic tools to identify problems before they become expensive repairs.
                        </p>
                        <Link href="/booking" className="inline-flex bg-red-600 hover:bg-red-700 text-white font-black py-5 px-12 rounded text-xs uppercase tracking-[0.2em] shadow-2xl shadow-red-600/20 transition-all transform hover:-translate-y-1">
                            BOOK APPOINTMENT NOW
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
