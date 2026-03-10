"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function CompleteProfilePage() {
    const [formData, setFormData] = useState({
        phone: "",
        address: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("auth_token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/user/complete-profile", formData);
            if (response.data.success) {
                setSuccess(true);
                // Update local storage user data
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...user, ...response.data.user }));

                setTimeout(() => {
                    if (user.role === "admin") {
                        router.push("/admin");
                    } else {
                        router.push("/dashboard");
                    }
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl -ml-48 -mb-48" />

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
                    <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
                        <div className="text-center mb-10">
                            <div className="flex justify-center mb-6">
                                <img src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="South Ring Autos" className="h-16 w-auto object-contain" />
                            </div>
                            <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-2">Complete Your Profile</h2>
                            <p className="text-slate-500 font-medium italic text-sm">We just need a few more details to provide you with the best service.</p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center shadow-sm">
                                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-6 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex flex-col items-center text-center shadow-sm">
                                <CheckCircle2 size={40} className="mb-3 text-green-600" />
                                <h4 className="font-black uppercase tracking-widest text-sm mb-1">Profile Updated!</h4>
                                <p className="text-xs font-medium">Taking you to your dashboard...</p>
                            </motion.div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</Label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                        <Input id="phone" type="tel" required value={formData.phone} onChange={handleChange} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="+254 700 000 000" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Physical Address</Label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                        <textarea id="address" required value={formData.address} onChange={handleChange} className="w-full pl-12 pr-4 py-4 h-32 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all text-sm" placeholder="e.g. Lang'ata Road, Nairobi" />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-[#003366] text-white py-5 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-900 shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center">
                                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />} Save & Continue
                                </Button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
}
