"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, CalendarDays, Car,
    Settings, LogOut, Menu, X, User, Bell, Wrench,
    ChevronDown, Home, Star, PlusCircle, Loader2, CreditCard
} from "lucide-react";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
    { icon: CalendarDays, label: "My Bookings", path: "/dashboard/bookings" },
    { icon: CreditCard, label: "Billing & Invoices", path: "/dashboard/payments" },
    { icon: Car, label: "My Vehicles", path: "/dashboard/vehicles" },
    { icon: Star, label: "Loyalty Program", path: "/dashboard/loyalty" },
    { icon: Settings, label: "Profile Settings", path: "/profile" },
];

function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={toggleSidebar} />}
            <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white text-slate-600 border-r border-slate-100 transition-transform duration-300 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
                <div className="flex items-center justify-between p-8">
                    <Link href="/" className="flex items-center group">
                        <Image src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="South Ring Autos" width={140} height={56} className="h-10 w-auto object-contain" style={{ width: "auto" }} />
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-red-600 transition-colors"><X size={24} /></button>
                </div>

                <div className="mt-4 px-6 mb-8">
                    <Link href="/booking">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1 group">
                            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Book Appointment</span>
                        </button>
                    </Link>
                </div>

                <nav className="px-4 space-y-1">
                    <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
                    {menuItems.map((item) => (
                        <Link key={item.path} href={item.path}
                            className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group ${isActive(item.path)
                                ? "bg-slate-50 text-[#003366] font-black"
                                : "hover:bg-slate-50/50 hover:text-[#003366]"}`}>
                            <item.icon size={20} className={`${isActive(item.path) ? "text-red-600" : "text-slate-400 group-hover:text-red-600"} transition-colors`} />
                            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                            {isActive(item.path) && <div className="absolute left-0 w-1 h-6 bg-red-600 rounded-r-full" />}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-slate-50 bg-slate-50/30">
                    <Link href="/" className="flex items-center space-x-4 px-6 py-4 rounded-2xl text-slate-500 hover:bg-white hover:text-[#003366] transition-all group mb-2">
                        <Home size={20} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                        <span className="text-xs font-bold uppercase tracking-wide">Back to Home</span>
                    </Link>
                    <button onClick={handleLogout} className="flex items-center space-x-4 w-full px-6 py-4 rounded-2xl text-red-600/70 hover:bg-red-50 hover:text-red-600 transition-all group">
                        <LogOut size={20} />
                        <span className="text-xs font-bold uppercase tracking-wide">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            if (res.data.success) setNotifications(res.data.data);
        } catch (err) { }
    };

    const markAsRead = async (id: number) => {
        try { await api.patch(`/notifications/${id}/read`); fetchNotifications(); } catch (err) { }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const unreadCount = notifications.filter(n => !n.read_status).length;

    return (
        <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between px-8 backdrop-blur-xl bg-white/80">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-3 lg:hidden text-slate-400 hover:bg-slate-50 rounded-2xl mr-4"><Menu size={24} /></button>
                <div className="hidden lg:flex items-center space-x-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Client Portal</span>
                    <span className="w-8 h-px bg-slate-200" />
                    <span className="text-[10px] font-black text-[#003366] uppercase tracking-[0.3em]">Welcome back</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-3 text-slate-400 hover:bg-slate-50 rounded-2xl relative transition-all ${notifOpen ? 'bg-slate-50 text-red-600' : ''}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-3 right-3 w-5 h-5 bg-red-600 rounded-full border-2 border-white text-[9px] font-black text-white flex items-center justify-center -translate-y-1 translate-x-1">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest">Notifications</h4>
                                {unreadCount > 0 && <span className="text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full">{unreadCount} New</span>}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer relative group ${!n.read_status ? 'bg-blue-50/20' : ''}`}
                                            onClick={() => markAsRead(n.id)}
                                        >
                                            {!n.read_status && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-full" />}
                                            <p className="text-[11px] font-black text-[#003366] uppercase tracking-tight mb-1">{n.title}</p>
                                            <p className="text-[10px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-3">{new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Bell size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                            <button className="w-full py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 hover:bg-slate-50 transition-all">Clear All</button>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-100" />

                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-4 pl-2 group">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-[#003366] uppercase tracking-tighter leading-none">{user?.name?.split(" ")[0]}</p>
                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1">Gold Member</p>
                        </div>
                        <div className="w-11 h-11 bg-slate-50 rounded-2xl border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden transition-all group-hover:border-red-600">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                                <User size={24} className="text-slate-300" />
                            )}
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                            <div className="px-6 py-6 bg-slate-50/50 border-b border-slate-100">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100">
                                        {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-300" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-[#003366] uppercase tracking-tighter truncate">{user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 truncate mt-1 lowercase">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3">
                                <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center space-x-4 px-5 py-4 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wide">
                                    <Settings size={18} className="text-slate-400" /><span>Profile Settings</span>
                                </Link>
                                <div className="my-2 border-t border-slate-50" />
                                <button onClick={handleLogout} className="flex items-center space-x-4 w-full px-5 py-4 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors uppercase tracking-wide">
                                    <LogOut size={18} /><span>Logout Account</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            router.replace("/login");
            return;
        }

        setIsAuthenticated(true);
    }, [router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-700 antialiased selection:bg-red-600 selection:text-white">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <div className="lg:pl-72 flex flex-col min-h-screen">
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                    {children}
                </main>
                <footer className="px-8 lg:px-12 py-10">
                    <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">
                            &copy; {new Date().getFullYear()} South Ring Autos. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-6">
                            <Link href="#" className="text-[9px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors">Privacy Policy</Link>
                            <Link href="#" className="text-[9px] font-black text-slate-400 hover:text-red-600 uppercase tracking-[0.2em] transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
