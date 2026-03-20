"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    MapPin, Phone, Facebook, Twitter, Instagram, Menu, X,
    User, LogOut, ChevronDown, Settings, LayoutDashboard, ExternalLink
} from "lucide-react";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [navLinks, setNavLinks] = useState<{ id: string; label: string; href: string; visible: boolean }[]>([]);
    const profileRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));

        // Fetch nav links from settings
        api.get('/settings').then(res => {
            const data = res.data.settings;
            if (data && data.nav_links) {
                try {
                    const parsed = typeof data.nav_links === 'string' ? JSON.parse(data.nav_links) : data.nav_links;
                    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                        setNavLinks(parsed);
                    }
                } catch (e) { }
            }
        }).catch(err => console.error("Could not load nav links", err));
    }, [pathname]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isActive = (path: string) => pathname === path ? "text-red-600" : "text-slate-700 hover:text-red-600";

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        setUser(null);
        router.push("/login");
        setIsOpen(false);
    };

    return (
        <header className="w-full sticky top-0 z-50 shadow-sm">
            {/* Topbar */}
            <div className="bg-white border-b border-slate-100 py-1 hidden lg:block text-[11px] font-medium text-slate-500">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex space-x-6">
                        <div className="flex items-center space-x-1.5">
                            <MapPin size={12} className="text-red-600" />
                            <span>Bogani East Lane, off Bogani East Road (Adjacent to CUEA)</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1.5">
                            <Phone size={12} className="text-red-600" />
                            <span>+254 704 113 472</span>
                        </div>
                        <div className="flex items-center space-x-3 border-l border-slate-200 ml-4 pl-4">
                            <a href="#" className="hover:text-red-600 transition-colors"><Facebook size={12} /></a>
                            <a href="#" className="hover:text-red-600 transition-colors"><Twitter size={12} /></a>
                            <a href="#" className="hover:text-red-600 transition-colors"><Instagram size={12} /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center">
                        <Image src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="South Ring Autos" width={160} height={64} className="h-16 w-auto object-contain" priority />
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-10 font-black text-[11px] uppercase tracking-[0.2em]">
                        {navLinks.length > 0 ? (
                            navLinks.map((link) => link.visible && (
                                <Link key={link.id} href={link.href} className={`${isActive(link.href)} transition-colors px-2`}>
                                    {link.label}
                                </Link>
                            ))
                        ) : (
                            // Fallback if settings haven't loaded or are empty
                            <>
                                <Link href="/" className={`${isActive("/")} transition-colors px-2`}>HOME</Link>
                                <Link href="/about" className={`${isActive("/about")} transition-colors px-2`}>ABOUT</Link>
                                <Link href="/services" className={`${isActive("/services")} transition-colors px-2`}>SERVICES</Link>
                                <Link href="/blog" className={`${isActive("/blog")} transition-colors px-2`}>BLOG</Link>
                                <Link href="/journal" className={`${isActive("/journal")} transition-colors px-2`}>JOURNAL</Link>
                                <Link href="/contact" className={`${isActive("/contact")} transition-colors px-2`}>CONTACT</Link>
                            </>
                        )}
                    </nav>

                    <div className="hidden lg:flex items-center space-x-3">
                        <Link href="/booking" className="bg-[#003366] text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center shadow-lg shadow-blue-900/10">
                            Book Appointment
                        </Link>

                        {user ? (
                            <div className="relative pl-4 border-l border-slate-100" ref={profileRef}>
                                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border border-slate-200" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <User size={16} className="text-slate-400" />
                                        </div>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{user.name?.split(" ")[0]}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <LayoutDashboard size={16} className="text-slate-400" /><span className="font-medium">Dashboard</span>
                                            </Link>
                                            <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <Settings size={16} className="text-slate-400" /><span className="font-medium">Profile Settings</span>
                                            </Link>
                                            {user.role === "admin" && (
                                                <>
                                                    <div className="my-1 border-t border-slate-100" />
                                                    <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                        <ExternalLink size={16} /><span className="font-medium">Admin Panel</span>
                                                    </Link>
                                                </>
                                            )}
                                            <div className="my-1 border-t border-slate-100" />
                                            <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                                                <LogOut size={16} /><span className="font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="border-2 border-red-600 text-red-600 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Login</Link>
                                <Link href="/register" className="bg-red-600 text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/10">Signup</Link>
                            </>
                        )}
                    </div>

                    <button className="lg:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 py-6 px-4 shadow-xl absolute w-full z-50">
                    <div className="flex flex-col space-y-4 font-bold text-sm uppercase tracking-wide">
                        {navLinks.length > 0 ? (
                            navLinks.map((link) => link.visible && (
                                <Link key={link.id} href={link.href} className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>
                                    {link.label}
                                </Link>
                            ))
                        ) : (
                            <>
                                <Link href="/" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Home</Link>
                                <Link href="/about" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>About</Link>
                                <Link href="/services" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Services</Link>
                                <Link href="/journal" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Journal</Link>
                                <Link href="/blog" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Blog</Link>
                                <Link href="/contact" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Contact</Link>
                            </>
                        )}
                        <hr className="border-slate-100" />
                        {user ? (
                            <div className="flex flex-col space-y-4 pt-2">
                                <div className="flex items-center space-x-3 text-slate-700"><User size={20} /><span>{user.name}</span></div>
                                {user.role === "admin" && <Link href="/admin" className="text-red-600" onClick={() => setIsOpen(false)}>Admin Panel</Link>}
                                <button onClick={handleLogout} className="flex items-center space-x-3 text-red-600"><LogOut size={20} /><span>Logout</span></button>
                            </div>
                        ) : (
                            <>
                                <Link href="/booking" className="bg-[#003366] text-white text-center py-3 rounded" onClick={() => setIsOpen(false)}>Book Appointment</Link>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/login" className="border-2 border-red-600 text-red-600 text-center py-2.5 rounded" onClick={() => setIsOpen(false)}>Login</Link>
                                    <Link href="/register" className="bg-red-600 text-white text-center py-2.5 rounded" onClick={() => setIsOpen(false)}>Signup</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
