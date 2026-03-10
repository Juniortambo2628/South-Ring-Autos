import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import heroBg1 from '../assets/images/Hero-Slide-BG-1.jpg';
import heroBg2 from '../assets/images/Hero-Slide-2-BG.jpg';

const Hero = () => {
    return (
        <div className="relative h-[90vh] min-h-[700px] w-full overflow-hidden bg-slate-900">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
                style={{ backgroundImage: `url(${heroBg2})` }}
            >
                <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex items-center pb-32 md:pb-40">
                <div className="max-w-2xl text-white">
                    <motion.h6
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center"
                    >
                        <span className="w-8 h-[2px] bg-red-600 mr-3"></span>
                        Transparency & Efficiency
                    </motion.h6>
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase"
                    >
                        From General Servicing to <br />
                        <span className="text-white">Full Engine Overhauls</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="text-sm md:text-base text-slate-200 mb-10 max-w-lg leading-relaxed font-medium"
                    >
                        We treat every vehicle with respect and care making sure that every vehicle gets the best service possible done by our experienced technicians.
                    </motion.p>
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a
                            href="/services"
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded text-xs font-black uppercase tracking-widest transition-all flex items-center group shadow-xl"
                        >
                            OUR SERVICES
                            <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="/contact"
                            className="bg-[#003366] hover:bg-blue-900 text-white px-8 py-3.5 rounded text-xs font-black uppercase tracking-widest transition-all flex items-center group shadow-xl"
                        >
                            CONTACT US
                            <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Carousel Arrows (Hidden on mobile) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 hidden md:block">
                <button className="p-2 border border-white/20 text-white/50 hover:text-white hover:border-white transition-all rounded-full bg-black/10 backdrop-blur-sm">
                    <ChevronLeft size={32} />
                </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4 hidden md:block">
                <button className="p-2 border border-white/20 text-white/50 hover:text-white hover:border-white transition-all rounded-full bg-black/10 backdrop-blur-sm">
                    <ChevronRight size={32} />
                </button>
            </div>
        </div>
    );
};

export default Hero;
