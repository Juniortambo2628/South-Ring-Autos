"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Car,
    Clock,
    Star,
    ChevronRight,
    ClipboardList,
    Wrench,
    Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import AddVehicleModal from "@/components/dashboard/AddVehicleModal";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            fetchStats();
        } else {
            router.push("/login");
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/dashboard/stats");
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Portal Overview</h2>
                    <p className="text-slate-500 font-medium italic">Welcome back, {user?.name?.split(' ')[0]}!</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link href="/booking">
                        <Button className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/10 transition-all flex items-center space-x-3">
                            <Calendar size={18} />
                            <span>New Booking</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: "Loyalty Points", value: stats?.loyalty_points || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                    { label: "Total Bookings", value: stats?.total_bookings || 0, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Registered Vehicles", value: stats?.total_vehicles || 0, icon: Car, color: "text-red-600", bg: "bg-red-50" },
                    { label: "Membership", value: stats?.membership_tier || "Bronze", icon: Star, color: "text-[#003366]", bg: "bg-slate-100" },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 border border-transparent group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black text-[#003366] uppercase tracking-[0.2em] flex items-center">
                                <Clock size={16} className="mr-3 text-red-600" /> Upcoming Appointments
                            </h3>
                            <Link href="/dashboard/bookings" className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">View All</Link>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {stats?.upcoming_appointments?.length > 0 ? (
                                stats.upcoming_appointments.map((booking: any) => (
                                    <div key={booking.id} className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-colors">
                                                <span className="text-[10px] font-black text-red-600 uppercase">{new Date(booking.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-black text-[#003366] leading-none">{new Date(booking.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight mb-1">{booking.service}</h4>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                        <Car size={12} className="mr-1.5" /> {booking.registration}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                        <Clock size={12} className="mr-1.5" /> {booking.message || "Service Appointment"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                                {booking.status || 'Scheduled'}
                                            </span>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                                        <Calendar size={32} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">No upcoming bookings found</p>
                                    <Link href="/booking">
                                        <Button variant="outline" className="rounded-xl px-8 uppercase tracking-widest font-black text-[9px]">Schedule Service</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-10">
                    <div className="bg-[#003366] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-700" />
                        <div className="relative z-10">
                            <Star size={32} className="text-amber-400 fill-amber-400 mb-6" />
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 opacity-60">Loyalty Rewards</h4>
                            <p className="text-4xl font-black tracking-tighter mb-8 leading-none">
                                {stats?.loyalty_points || 0} <span className="text-xs uppercase tracking-widest font-bold opacity-40 ml-2">Points</span>
                            </p>
                            <div className="bg-white/10 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-4 flex items-center">
                                    Current Tier:
                                    <span className="text-red-600 text-xs tracking-[0.2em] ml-2">{stats?.membership_tier || 'Bronze'}</span>
                                </p>
                                <Link href="/dashboard/loyalty">
                                    <Button className="w-full bg-slate-50 hover:bg-slate-100 text-[#003366] border border-slate-200 rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-none">
                                        Redeem Rewards
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-[10px] font-black text-[#003366] uppercase tracking-widest">Your Garage</h4>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsAddVehicleOpen(true)}
                                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center"
                                >
                                    <Plus size={10} className="mr-1" /> Add New
                                </button>
                                <span className="text-slate-200">|</span>
                                <Link href="/dashboard/vehicles" className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline">View All</Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {stats?.recent_vehicles?.length > 0 ? (
                                stats.recent_vehicles.map((v: any) => (
                                    <div key={v.id} className="flex items-center space-x-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-red-600/20 transition-all cursor-pointer group">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
                                            <Car size={20} className="text-[#003366]" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-[#003366] uppercase tracking-tight">{v.make} {v.model}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.registration}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[9px] font-bold text-slate-400 uppercase text-center py-4">No vehicles registered</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <AddVehicleModal
                open={isAddVehicleOpen}
                onOpenChange={setIsAddVehicleOpen}
                onSuccess={fetchStats}
            />
        </DashboardLayout>
    );
}
