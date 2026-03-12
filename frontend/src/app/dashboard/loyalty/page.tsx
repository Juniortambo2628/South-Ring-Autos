"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import {
    Star, Gift, TrendingUp, History,
    ChevronRight, Zap, Award, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const rewards = [
    { id: 1, title: "Free Oil Filter", points: "200", icon: Gift, color: "text-blue-600", bg: "bg-blue-50" },
    { id: 2, title: "10% Off Full Service", points: "500", icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
    { id: 3, title: "Complimentary Car Wash", points: "150", icon: Sparkles, color: "text-green-600", bg: "bg-green-50" },
];

export default function LoyaltyPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get("/dashboard/stats");
            if (res.data.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch loyalty stats", err);
        } finally {
            setLoading(false);
        }
    };

    const nextTierPoints = 500;
    const currentPoints = stats?.loyalty_points || 0;
    const progress = Math.min((currentPoints / nextTierPoints) * 100, 100);
    const pointsNeeded = Math.max(nextTierPoints - currentPoints, 0);

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
            <div className="mb-12">
                <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Loyalty Program</h2>
                <p className="text-slate-500 font-medium italic">Your journey with South Ring Autos rewards every mile</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Points Overview */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-[#003366] rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                        <div className="relative z-10">
                            <div className="flex items-center space-x-6 mb-10">
                                <div className="p-5 bg-white/10 rounded-[28px] border border-white/20 backdrop-blur-md shadow-lg">
                                    <Star size={40} className="text-amber-400 fill-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-1">Current Balance</p>
                                    <h3 className="text-6xl font-black tracking-tighter">{currentPoints} <span className="text-sm uppercase tracking-widest font-bold opacity-40 ml-2">Points</span></h3>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-3">
                                    <span className="text-white/60">Current Tier: <span className="text-red-400 ml-2">{stats?.membership_tier || "Bronze"}</span></span>
                                    {pointsNeeded > 0 && <span className="text-white/60">Next Tier: <span className="text-white ml-2">Platinum (500)</span></span>}
                                </div>
                                <div className="w-full bg-white/10 h-5 rounded-full p-1.5 border border-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full shadow-lg shadow-red-600/50"
                                    />
                                </div>
                                {pointsNeeded > 0 ? (
                                    <p className="text-[10px] font-bold italic text-white/40 pt-4 flex items-center">
                                        <Zap size={14} className="mr-2 text-amber-400" />
                                        You are just {pointsNeeded} points away from unlocking Platinum benefits!
                                    </p>
                                ) : (
                                    <p className="text-[10px] font-bold italic text-white/40 pt-4 flex items-center">
                                        <Award size={14} className="mr-2 text-amber-400" />
                                        Excellent! You've reached the highest tier and unlocked all benefits.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Available Rewards */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-[#003366] uppercase tracking-[0.3em] flex items-center">
                                <Gift size={18} className="mr-3 text-red-600" /> Exclusive Rewards
                            </h3>
                            <button className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {rewards.map((reward, idx) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm text-center hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                                >
                                    <div className={`inline-flex p-5 rounded-[24px] ${reward.bg} ${reward.color} mb-6 group-hover:scale-110 transition-transform`}>
                                        <reward.icon size={28} />
                                    </div>
                                    <h4 className="text-xs font-black text-[#003366] uppercase tracking-tight mb-4 leading-relaxed">{reward.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{reward.points} Points Required</p>
                                    <Button
                                        disabled={currentPoints < parseInt(reward.points)}
                                        onClick={() => toast({ title: "Coming Soon", description: "Reward redemption will be available shortly." })}
                                        className="w-full bg-slate-50 hover:bg-red-600 hover:text-white text-[#003366] border border-slate-100 rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest transition-all shadow-none disabled:opacity-30 disabled:hover:bg-slate-50 disabled:hover:text-[#003366]"
                                    >
                                        {currentPoints < parseInt(reward.points) ? 'Insufficient Points' : 'Redeem Now'}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Activity */}
                <div className="space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-[10px] font-black text-[#003366] uppercase tracking-widest flex items-center">
                                <History size={16} className="mr-3 text-red-600" /> Recent Activity
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            <div className="p-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                    <TrendingUp size={32} className="text-slate-200" />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No activity log found</p>
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-50">
                            <Button onClick={() => toast({ title: "Coming Soon", description: "Points earning guide will be available shortly." })} variant="outline" className="w-full rounded-2xl h-12 text-[9px] font-black uppercase tracking-widest text-[#003366] border-slate-200 shadow-none">
                                How to Earn Points
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-[40px] p-10 border border-amber-100/50 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Sparkles size={32} className="text-amber-500 mb-6" />
                            <h4 className="text-sm font-black text-[#003366] uppercase tracking-tighter mb-4">Refer a Friend</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">Earn 100 points for every successfully booked clinic appointment from your referral.</p>
                            <Button onClick={() => toast({ title: "Coming Soon", description: "Referral program will be available shortly." })} className="w-full bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-900/10 transition-all border-none">
                                Invite Friends
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
