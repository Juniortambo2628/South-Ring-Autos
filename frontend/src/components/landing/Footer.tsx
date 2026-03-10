"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, ChevronRight } from "lucide-react";

const services = ["General Service", "Engine Overhaul", "Accident Repair", "ECU Diagnostics", "Injector Cleaning"];
const quickLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Our Services", href: "/services" },
    { label: "Book a Service", href: "/booking" },
    { label: "Contact Us", href: "/contact" },
    { label: "Blog", href: "/blog" },
];

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t-8 border-red-600">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Address */}
                    <div>
                        <h4 className="text-white text-base font-black mb-8 uppercase tracking-widest">Address</h4>
                        <div className="flex items-start mb-6 group">
                            <MapPin className="mr-4 text-red-600 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" size={20} />
                            <p className="text-sm leading-relaxed font-medium">Bogani East Lane, off Bogani East Road (Adjacent to Catholic University of East Africa)</p>
                        </div>
                        <div className="flex items-center mb-6 group">
                            <Phone className="mr-4 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform" size={20} />
                            <p className="text-sm font-black">+254 704 113 472</p>
                        </div>
                        <div className="flex items-center mb-10 group">
                            <Mail className="mr-4 text-red-600 flex-shrink-0 group-hover:scale-110 transition-transform" size={20} />
                            <p className="text-sm font-medium">southringautos@gmail.com</p>
                        </div>
                        <div className="flex space-x-4">
                            {[Twitter, Facebook, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 border border-slate-700 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-lg">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Opening Hours */}
                    <div>
                        <h4 className="text-white text-base font-black mb-8 uppercase tracking-widest">Opening Hours</h4>
                        <div className="space-y-6">
                            <div>
                                <h6 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Monday - Friday:</h6>
                                <p className="text-sm font-bold text-white uppercase tracking-widest">8:00 — 18:00</p>
                            </div>
                            <div>
                                <h6 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2">Saturday:</h6>
                                <p className="text-sm font-bold text-white uppercase tracking-widest">8:00 — 14:00</p>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-white text-base font-black mb-8 uppercase tracking-widest">Services</h4>
                        <ul className="space-y-4">
                            {services.map((s) => (
                                <li key={s}>
                                    <Link href="/services" className="flex items-center hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wide group">
                                        <ChevronRight size={14} className="mr-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />{s}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white text-base font-black mb-8 uppercase tracking-widest">Quick Links</h4>
                        <ul className="space-y-4">
                            {quickLinks.map((l) => (
                                <li key={l.label}>
                                    <Link href={l.href} className="flex items-center hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wide group">
                                        <ChevronRight size={14} className="mr-2 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />{l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
                        <p>&copy; {new Date().getFullYear()} <span className="text-white">South Ring Autos Limited</span>. All Rights Reserved.</p>
                        <div className="flex items-center space-x-4">
                            <a href="#" className="hover:text-red-600 transition-colors">Terms</a>
                            <span className="text-slate-800">|</span>
                            <a href="#" className="hover:text-red-600 transition-colors">Privacy</a>
                        </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center space-x-8">
                        <div className="flex space-x-6">
                            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
                            <Link href="/about" className="hover:text-red-600 transition-colors">About</Link>
                            <Link href="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
                        </div>
                        <button onClick={() => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })} className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700 transition-all ml-4">
                            <ChevronRight className="-rotate-90" size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
