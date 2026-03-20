"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, CalendarDays, FileText, MessageSquare,
    Settings, LogOut, Menu, X, UserCircle, Bell, Wrench,
    ChevronDown, ExternalLink, Plus, CreditCard, Car, Users,
    Truck, Activity, BookOpen, Mail
} from "lucide-react";
import api from "@/lib/api";
import { NotificationProvider, useNotifications } from "@/lib/NotificationContext";

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: CalendarDays, label: "All Bookings", path: "/admin/bookings" },
    { icon: CreditCard, label: "Payments", path: "/admin/payments" },
    { icon: Car, label: "Vehicles", path: "/admin/vehicles" },
    { icon: Users, label: "Clients", path: "/admin/clients" },
    { icon: Truck, label: "Deliveries", path: "/admin/deliveries" },
    { icon: Wrench, label: "Services", path: "/admin/services" },
    { icon: FileText, label: "Blog Posts", path: "/admin/blog" },
    { icon: BookOpen, label: "Journals", path: "/admin/journals" },
    { icon: Quote, label: "Testimonials", path: "/admin/testimonials" },
    { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: Mail, label: "Email Templates", path: "/admin/email-templates" },
];

function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    const isActive = (path: string) => path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={toggleSidebar} />}
            <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-slate-100 transition-transform duration-300 z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 flex flex-col`}>
                <div className="p-8 flex-shrink-0 pb-6">
                    <Link href="/admin" className="flex items-center space-x-3 group mb-10">
                        <img src="/images/logo-sra.png" alt="South Ring" className="h-10 w-auto" />
                        <div className="flex flex-col">
                            <span className="font-black text-sm text-[#003366] tracking-tighter leading-none uppercase">South Ring</span>
                            <span className="font-bold text-[9px] text-red-600 tracking-[0.3em] uppercase">Autos Console</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4 pt-2">Main Menu</p>
                    <nav className="space-y-1.5 pb-6">
                        {menuItems.map((item) => (
                            <Link key={item.path} href={item.path}
                                className={`flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all relative group ${isActive(item.path)
                                    ? "bg-slate-50 text-red-600"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-[#003366]"}`}>
                                {isActive(item.path) && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full" />}
                                <item.icon size={20} className={isActive(item.path) ? "text-red-600" : "text-slate-400 group-hover:text-[#003366]"} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive(item.path) ? "text-[#003366]" : ""}`}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Footer removed and moved to Header Profile Dropdown */}
            </aside>
        </>
    );
}

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
    const [user, setUser] = useState<any>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAll } = useNotifications();

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try { await api.post("/logout"); } catch { }
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    return (
        <header className="h-28 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8 lg:px-12">
            <div className="flex items-center space-x-4">
                <button onClick={toggleSidebar} className="p-2 lg:hidden text-slate-400 hover:bg-slate-50 rounded-xl"><Menu size={24} /></button>
                <div className="flex flex-col">
                    <div className="flex items-center space-x-3 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        <span>Admin Portal</span>
                        <span className="w-8 h-px bg-slate-200" />
                        <span className="text-[#003366]">Dashboard</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-8">
                {/* New Appointment Button moved here from Sidebar */}
                <Link href="/admin/bookings" className="hidden md:block">
                    <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[9px] flex items-center space-x-2 shadow-lg shadow-red-600/20 transition-all">
                        <Plus size={16} />
                        <span>New Appointment</span>
                    </button>
                </Link>

                <div className="relative" ref={notifRef}>
                    <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-100 transition-all group shadow-sm z-10">
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute top-3 right-3 w-5 h-5 bg-red-600 rounded-full border-2 border-white text-[9px] font-black text-white flex items-center justify-center -translate-y-1 translate-x-1">{unreadCount}</span>}
                    </button>
                    {notificationsOpen && (
                        <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden z-[100] animate-in slide-in-from-top-4">
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#003366]">Notifications</span>
                                {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-black rounded-full">{unreadCount} New</span>}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer relative ${!n.read_at ? 'bg-blue-50/20' : ''}`}
                                            onClick={() => {
                                                if (!n.read_at) markAsRead(n.id);
                                                if (n.link) router.push(n.link);
                                            }}
                                        >
                                            {!n.read_at && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-full" />}
                                            <p className="text-[11px] font-bold text-[#003366] mb-1 pl-2">{n.title}</p>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 pl-2">{n.message}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 pl-2">{new Date(n.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center flex justify-between px-4">
                                <button onClick={markAllAsRead} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#003366] transition-colors">Mark all as read</button>
                                <button onClick={deleteAll} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors">Clear All</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-4 pl-4 md:pl-8 border-l border-slate-100 relative" ref={dropdownRef}>
                    <div className="text-right hidden sm:block">
                        <p className="text-[11px] font-black text-[#003366] uppercase tracking-tight">{user?.name || "Super Admin"}</p>
                        <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Administrator</p>
                    </div>
                    <button onClick={() => setProfileOpen(!profileOpen)} className="relative w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden hover:border-red-600/20 transition-all shadow-sm z-10">
                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserCircle size={28} className="text-slate-300" />}
                    </button>
                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-4 w-64 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden z-[100] animate-in slide-in-from-top-4">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden mb-3 shadow-sm">
                                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserCircle size={32} className="text-slate-300" />}
                                </div>
                                <p className="text-sm font-black text-[#003366] uppercase tracking-tight">{user?.name || "Super Admin"}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{user?.email || "admin@southring.com"}</p>
                            </div>
                            <div className="p-2 border-t border-slate-50">
                                <Link href="/" className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-[#003366] transition-colors">
                                    <ExternalLink size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">View Website</span>
                                </Link>
                                <Link href="/admin/settings" onClick={() => setProfileOpen(false)} className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-[#003366] transition-colors">
                                    <Settings size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Account Settings</span>
                                </Link>
                                <div className="h-px bg-slate-50 my-1 mx-2" />
                                <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                                    <LogOut size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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

        try {
            const user = JSON.parse(userStr);
            if (user.role !== "admin") {
                router.replace("/dashboard");
                return;
            }
            setIsAuthenticated(true);
        } catch (e) {
            router.replace("/login");
        }
    }, [router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Authorization...</p>
            </div>
        );
    }

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-slate-50 font-sans text-[#003366]">
                <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                <div className="lg:pl-72 flex flex-col min-h-screen">
                    <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 p-8 lg:p-12 pt-0">{children}</main>
                    <footer className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-100 mx-12">
                        &copy; {new Date().getFullYear()} South Ring Autos - Administrative Management System
                    </footer>
                </div>
            </div>
        </NotificationProvider>
    );
}
