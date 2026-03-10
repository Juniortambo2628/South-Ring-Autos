import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShieldCheck, Wrench, ArrowRight } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Image Area - Legacy Framing */}
                    <div className="lg:w-1/2 relative">
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-[12px] border-slate-50">
                            <img
                                src="/images/Hero-Slide-2-BG.jpg"
                                alt="South Ring Autos Workshop"
                                className="w-full h-auto object-cover aspect-[4/3]"
                            />
                        </div>
                        {/* Status Floaties */}
                        <div className="absolute -bottom-6 -left-6 bg-red-600 text-white p-6 rounded-xl shadow-2xl z-20 hidden md:block">
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl font-black">15+</div>
                                <div className="text-[10px] font-black uppercase tracking-widest leading-tight">Years OF <br />CAR REPAIR EXPERIENCE</div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center">
                                <span className="w-8 h-[2px] bg-red-600 mr-3"></span>
                                WHO WE ARE
                                <span className="w-8 h-[2px] bg-red-600 ml-3"></span>
                            </h6>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight uppercase">
                                We're South Ring Autos – <br />
                                <span className="text-[#003366]">Your Neighbourhood Auto Clinic</span>
                            </h2>
                            <p className="text-slate-500 text-base mb-8 leading-relaxed font-medium">
                                We treat every vehicle with respect and care making sure that every vehicle gets the best service possible done by our experienced technicians. We fix, tune and care for cars so you can get back on the road faster.
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="flex items-start space-x-4 group">
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900 uppercase text-sm tracking-wide mb-1">Transparent Pricing</h5>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Honest estimates and itemised invoices — no hidden charges.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4 group">
                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                                        <Wrench size={24} />
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-900 uppercase text-sm tracking-wide mb-1">Material Guarantee</h5>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">We use proper equipment so problems get fixed right the first time.</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="/about"
                                className="inline-flex bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1"
                            >
                                Read more <ArrowRight size={16} className="ml-2" />
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
