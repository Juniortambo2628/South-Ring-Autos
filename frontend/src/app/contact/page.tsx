"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="Get In Touch"
                    subtitle="Have a question? Need a quote? Our team is standing by to assist you with all your automotive needs."
                    breadcrumb={[{ label: "CONTACT", href: "/contact" }]}
                />

                <section className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-16">
                            {/* Contact Info */}
                            <div className="lg:w-1/3">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center">
                                        <span className="w-8 h-[2px] bg-red-600 mr-3" />CAR CLINIC INFO<span className="w-8 h-[2px] bg-red-600 ml-3" />
                                    </h6>
                                    <h2 className="text-4xl font-black text-slate-900 mb-10 leading-tight uppercase">Visit Us Anytime</h2>

                                    <div className="space-y-10">
                                        {[
                                            { icon: MapPin, title: "Location", content: "Bogani East Lane, off Bogani East Road (Adjacent to CUEA), Karen, Nairobi" },
                                            { icon: Phone, title: "Phone", content: "+254 704 113 472" },
                                            { icon: Mail, title: "Email", content: "info@southringautos.com" },
                                            { icon: Clock, title: "Working Hours", content: "Mon - Sat: 8:00 AM - 6:00 PM" }
                                        ].map((item) => (
                                            <div key={item.title} className="flex items-start space-x-5">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm">
                                                    <item.icon size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-[#003366] uppercase tracking-widest mb-1">{item.title}</h4>
                                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-12 flex items-center space-x-4">
                                        {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                                            <a key={idx} href="#" className="w-10 h-10 bg-[#003366] text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-blue-900/10">
                                                <Icon size={18} />
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Contact Form */}
                            <div className="lg:w-2/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100"
                                >
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all" placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all" placeholder="john@example.com" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                                <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all" placeholder="+254 700 000 000" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Subject</label>
                                                <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all appearance-none cursor-pointer">
                                                    <option>General Inquiry</option>
                                                    <option>Service Quote</option>
                                                    <option>Feedback</option>
                                                    <option>Urgent Repair</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] ml-1">Your Message</label>
                                            <textarea rows={6} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all resize-none" placeholder="How can we help you today?"></textarea>
                                        </div>
                                        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 px-10 rounded text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center">
                                            SEND MESSAGE <Send size={16} className="ml-2" />
                                        </button>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="h-[500px] w-full bg-slate-100 grayscale hover:grayscale-0 transition-all duration-700 border-t border-slate-200">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.75624747!2d36.75!3d-1.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjEnMDAuMCJTIDM2wrA0NScwMC4wIkU!5e0!3m2!1sen!2ske!4v1600000000000!5m2!1sen!2ske"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                </section>
            </main>
            <Footer />
        </div>
    );
}
