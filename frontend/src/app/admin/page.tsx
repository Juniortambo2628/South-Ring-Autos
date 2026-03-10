"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    CalendarDays, FileText, MessageSquare, TrendingUp, ChevronRight, Search, Edit2, Trash2, CheckCircle2,
    XCircle, Clock, Calendar, User, Phone, Car,
    ChevronLeft, Loader2, Filter, Plus, ClipboardList, Star, Users
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

function StatCard({ title, value, icon: Icon, color, bg }: {
    title: string; value: number; icon: any; color: string; bg: string;
}) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
        >
            <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6 border border-transparent group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">{value}</h3>
        </motion.div>
    );
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/admin/stats");
            if (res.data.success) {
                setStats(res.data.data);
                setRecentBookings(res.data.data.recent_bookings || []);
            }
        } catch (err) {
            console.error("Failed to fetch admin stats", err);
        } finally {
            setLoading(false);
        }
    };

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Administrative Console</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">System Overview</h2>
                    <p className="text-slate-500 font-medium italic">Welcome back, Super Admin</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link href="/admin/bookings">
                        <Button className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/10 transition-all flex items-center space-x-3">
                            <Plus size={18} />
                            <span>New Booking</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-slate-50 rounded-[32px] animate-pulse border border-slate-100" />)}
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Total Bookings" value={stats?.total_bookings || 0} icon={ClipboardList} color="text-blue-600" bg="bg-blue-50" />
                    <StatCard title="Pending Service" value={stats?.pending_bookings || 0} icon={Clock} color="text-amber-500" bg="bg-amber-50" />
                    <StatCard title="System Users" value={stats?.total_users || 0} icon={Users} color="text-red-600" bg="bg-red-50" />
                    <StatCard title="Blog Activity" value={stats?.total_posts || 0} icon={FileText} color="text-[#003366]" bg="bg-slate-100" />
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden text-[#003366]">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
                                <Clock size={16} className="mr-3 text-red-600" /> Recent Appointments
                            </h3>
                            <Link href="/admin/bookings" className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentBookings.length > 0 ? (
                                recentBookings.map((booking: any) => (
                                    <div key={booking.id} className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group text-[#003366]">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-colors">
                                                <span className="text-[10px] font-black text-red-600 uppercase">{new Date(booking.date || booking.preferred_date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none">{new Date(booking.date || booking.preferred_date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-tight mb-1">{booking.name || booking.customer_name}</h4>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                        <Car size={12} className="mr-1.5" /> {booking.registration}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                        <Clock size={12} className="mr-1.5" /> {booking.service}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-red-50 text-red-600 border-red-100'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                                        <ClipboardList size={32} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent appointments</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-[#003366] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
                        <div className="relative z-10">
                            <Star size={32} className="text-amber-400 fill-amber-400 mb-6" />
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-60">System Security</h4>
                            <p className="text-4xl font-black tracking-tighter mb-8 leading-none">
                                SECURE <span className="text-xs uppercase tracking-widest font-bold opacity-40 ml-2">Active</span>
                            </p>
                            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                                    Logs Integrity:
                                    <span className="text-green-400 text-xs tracking-[0.2em] ml-2">VERIFIED</span>
                                </p>
                                <Button className="w-full bg-slate-50 hover:bg-slate-100 text-[#003366] border border-slate-200 rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-none">
                                    Audit System Logs
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest">Quick Management</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Clients", icon: Users, path: "/admin/clients" },
                                { label: "Services", icon: ClipboardList, path: "/admin/services" },
                                { label: "Payments", icon: Star, path: "/admin/payments" },
                                { label: "Settings", icon: FileText, path: "/admin/settings" },
                            ].map((item, i) => (
                                <Link key={i} href={item.path} className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-red-600/20 transition-all group">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                        <item.icon size={20} className="text-[#003366]" />
                                    </div>
                                    <span className="text-[9px] font-black text-[#003366] uppercase tracking-widest">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
