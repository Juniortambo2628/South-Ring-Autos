"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Wrench, ChevronRight, Clock,
    CheckCircle2, AlertCircle, Search, Filter, Loader2,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { Booking } from "@/types";
import { useToast } from "@/hooks/use-toast";

const STAGES = ["Received", "Diagnostics", "Parts Sourcing", "Repairing", "QA Testing", "Ready"];

export default function BookingsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [progressData, setProgressData] = useState<any[]>([]);
    const [progressLoading, setProgressLoading] = useState(false);
    const [isProgressOpen, setIsProgressOpen] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get("/user/bookings");
                if (res.data.success) {
                    setBookings(res.data.data);
                }
            } catch (err: any) {
                console.error("Failed to load bookings");
                toast({
                    variant: 'destructive',
                    title: 'Error loading bookings',
                    description: err.response?.data?.message || 'Could not fetch your appointments from the server.',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const openProgress = async (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setIsProgressOpen(true);
        setProgressLoading(true);
        try {
            const res = await api.get(`/bookings/${bookingId}/progress`);
            if (res.data.success) {
                setProgressData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load progress");
        } finally {
            setProgressLoading(false);
        }
    };

    const getLatestStage = () => {
        if (progressData.length === 0) return -1;
        const latestStage = progressData[0]?.stage || "";
        return STAGES.findIndex(s => s.toLowerCase() === latestStage.toLowerCase());
    };

    const getLatestPercentage = () => {
        if (progressData.length === 0) return 0;
        return progressData[0]?.progress_percentage || 0;
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">My Bookings</h2>
                    <p className="text-slate-500 font-medium italic">Track your service appointments and history</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-600/5 focus:border-red-600 transition-all w-64 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 rounded-2xl h-[52px] px-6 shadow-sm transition-all flex items-center space-x-2">
                        <Filter size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#003366]">Filter</span>
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px]">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">No Bookings Found</h3>
                        <p className="text-xs font-bold text-slate-400 mb-6 max-w-sm">You haven't made any service appointments yet. Book an appointment to keep your vehicle in top shape.</p>
                        <Button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[9px] shadow-xl shadow-red-600/20" onClick={() => window.location.href = '/booking'}>
                            Book Now
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vehicle</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {bookings.filter(b => b.service?.toLowerCase().includes(searchTerm.toLowerCase()) || b.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) || b.registration?.toLowerCase().includes(searchTerm.toLowerCase())).map((booking, idx) => (
                                    <motion.tr
                                        key={booking.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-7">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-colors">
                                                    <Wrench size={20} className="text-[#003366]" />
                                                </div>
                                                <span className="text-xs font-black text-[#003366] uppercase tracking-tight">{booking.service}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-loose">
                                                {booking.vehicle ? `${booking.registration} - ${booking.vehicle.make} ${booking.vehicle.model}` : booking.registration || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center text-[10px] font-black text-[#003366] uppercase tracking-widest">
                                                    <Calendar size={14} className="mr-2 text-red-600" /> {booking.date ? new Date(booking.date).toLocaleDateString() : "TBD"}
                                                </div>
                                                <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-5">
                                                    Morning
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className={`inline-flex px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${booking.status === "completed" ? "bg-green-50 text-green-600 border-green-100" :
                                                booking.status === "confirmed" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    booking.status === "cancelled" ? "bg-red-50 text-red-600 border-red-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                                }`}>
                                                {booking.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <button
                                                onClick={() => openProgress(booking.id)}
                                                className="p-3 text-slate-300 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm flex items-center space-x-2"
                                                title="Track Progress"
                                            >
                                                <Activity size={16} />
                                                <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Track</span>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Repair Progress Modal */}
            <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <DialogContent className="bg-white border-slate-100 rounded-[32px] overflow-hidden p-0 max-w-lg">
                    <DialogHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                        <DialogTitle className="text-xl font-black text-[#003366] uppercase tracking-tight flex items-center">
                            <Activity className="mr-3 text-red-600" size={22} /> Repair Progress
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8">
                        {progressLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading progress...</p>
                            </div>
                        ) : progressData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                                    <Clock size={24} className="text-slate-300" />
                                </div>
                                <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">No Updates Yet</h3>
                                <p className="text-xs font-bold text-slate-400 max-w-xs">Your vehicle hasn't started being serviced yet. Updates will appear here once the workshop begins work.</p>
                            </div>
                        ) : (
                            <div>
                                {/* Progress Bar */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</span>
                                        <span className="text-sm font-black text-[#003366]">{getLatestPercentage()}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getLatestPercentage()}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>

                                {/* Stage Stepper */}
                                <div className="space-y-0 mb-6">
                                    {STAGES.map((stage, i) => {
                                        const latestIdx = getLatestStage();
                                        const isCompleted = i <= latestIdx;
                                        const isCurrent = i === latestIdx;
                                        return (
                                            <div key={stage} className="flex items-start">
                                                <div className="flex flex-col items-center mr-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? "bg-green-500 border-green-500 text-white" :
                                                        isCurrent ? "bg-red-600 border-red-600 text-white animate-pulse" :
                                                            "bg-white border-slate-200 text-slate-300"
                                                        }`}>
                                                        {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-black">{i + 1}</span>}
                                                    </div>
                                                    {i < STAGES.length - 1 && (
                                                        <div className={`w-0.5 h-8 ${isCompleted ? "bg-green-500" : "bg-slate-200"}`} />
                                                    )}
                                                </div>
                                                <div className={`pt-1 pb-4 ${isCurrent ? "opacity-100" : isCompleted ? "opacity-70" : "opacity-40"}`}>
                                                    <span className={`block text-xs font-black uppercase tracking-widest ${isCurrent ? "text-red-600" : isCompleted ? "text-green-600" : "text-slate-400"}`}>{stage}</span>
                                                    {isCurrent && progressData[0]?.description && (
                                                        <span className="block text-[10px] font-bold text-slate-500 mt-1">{progressData[0].description}</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Recent Updates */}
                                {progressData.length > 1 && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Update History</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {progressData.slice(1).map((p: any) => (
                                                <div key={p.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[10px]">
                                                    <span className="font-black text-[#003366] uppercase tracking-widest">{p.stage}</span>
                                                    <span className="text-slate-400 ml-2">({p.progress_percentage}%)</span>
                                                    {p.description && <p className="font-bold text-slate-500 mt-1">{p.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
