"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import AboutSection from "@/components/landing/AboutSection";
import FactsSection from "@/components/landing/FactsSection";
import { motion } from "framer-motion";
import { Target, Eye, Heart, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
    const values = [
        {
            icon: Target,
            title: "Our Mission",
            description: "To provide reliable, high-quality automotive repair and maintenance services that ensure the safety and satisfaction of our clients through transparency and technical excellence."
        },
        {
            icon: Eye,
            title: "Our Vision",
            description: "To be the most trusted and preferred neighborhood auto clinic in Karen and beyond, setting the standard for expert car care and customer service."
        },
        {
            icon: Heart,
            title: "Core Values",
            description: "Integrity, Professionalism, and Customer Centricity. We believe in doing the job right the first time and treating every car as if it were our own."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="About South Ring Autos"
                    subtitle="Learn more about our heritage, our commitment to quality, and why we are Karen's preferred auto clinic."
                    breadcrumb={[{ label: "ABOUT", href: "/about" }]}
                />

                {/* Introductory section using existing component style */}
                <AboutSection />

                {/* Mission, Vision, Values */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {values.map((value, index) => (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform"
                                >
                                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-red-600/20 group-hover:rotate-6 transition-transform">
                                        <value.icon size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-[#003366] mb-4 uppercase tracking-tight">{value.title}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <FactsSection />

                {/* Why Choose Us details */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2">
                                <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center">
                                    <span className="w-8 h-[2px] bg-red-600 mr-3" />WHY CHOOSE US<span className="w-8 h-[2px] bg-red-600 ml-3" />
                                </h6>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight uppercase">
                                    Excellence in every <br /><span className="text-[#003366]">bolt and nut</span>
                                </h2>
                                <p className="text-slate-500 text-base mb-10 leading-relaxed font-medium">
                                    With over 15 years of experience in the automotive industry, South Ring Autos has built a reputation for perfection. We combine technical expertise with a customer-first approach to ensure your peace of mind.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        "Certified Technicians",
                                        "Genuine Spare Parts",
                                        "Modern Diagnostic Tools",
                                        "Detailed Repair Invoices",
                                        "Quick Turnaround Time",
                                        "Complimentary Wash"
                                    ].map((feature) => (
                                        <div key={feature} className="flex items-center space-x-3">
                                            <CheckCircle2 size={20} className="text-red-600 flex-shrink-0" />
                                            <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="lg:w-1/2 relative">
                                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-[12px] border-slate-50">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_ASSET_URL || ""}/images/Engine-repairs.jpg`}
                                        alt="Our technical team at work"
                                        className="w-full h-auto object-cover aspect-video"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
