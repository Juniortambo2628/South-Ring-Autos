"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface PageHeroProps {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    breadcrumb?: { label: string; href: string }[];
}

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function PageHero({
    title,
    subtitle,
    backgroundImage = "/images/Hero-Slide-2-BG.jpg",
    breadcrumb = []
}: PageHeroProps) {
    return (
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-slate-900">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${ASSET}${backgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
            </div>

            <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <nav className="flex items-center justify-center space-x-2 mb-6">
                        <Link href="/" className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors">HOME</Link>
                        {breadcrumb.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <ChevronRight size={12} className="text-slate-500" />
                                <Link href={item.href} className="text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">{item.label}</Link>
                            </div>
                        ))}
                    </nav>

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter">
                        {title}
                    </h1>

                    {subtitle && (
                        <p className="max-w-2xl mx-auto text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Design Element */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
        </div>
    );
}
