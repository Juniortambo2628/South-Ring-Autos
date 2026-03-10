"use client";

import { motion } from "framer-motion";
import { CheckCircle, Users, Car, Clock } from "lucide-react";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

const facts = [
    { icon: <CheckCircle size={32} />, count: 500, label: "Satisfied Clients" },
    { icon: <Users size={32} />, count: 15, label: "Expert Technicians" },
    { icon: <Car size={32} />, count: 1000, label: "Complete Projects" },
    { icon: <Clock size={32} />, count: 3, label: "Years Experience" },
];

export default function FactsSection() {
    return (
        <section
            className="py-16 bg-slate-900 relative overflow-hidden bg-cover bg-fixed bg-center"
            style={{ backgroundImage: `url(${ASSET}/images/Stats-summary-strip-BG.jpg)` }}
        >
            <div className="absolute inset-0 bg-slate-900/80" />
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {facts.map((fact, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl text-center text-white border border-white/10 hover:bg-white/10 transition-all group"
                        >
                            <div className="text-white mb-4 flex justify-center transform group-hover:scale-110 transition-transform">{fact.icon}</div>
                            <h3 className="text-4xl md:text-5xl font-black mb-2 text-white">{fact.count}</h3>
                            <p className="font-bold uppercase tracking-[0.2em] text-[10px] text-slate-400">{fact.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
