"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User, Mail, Phone, MapPin, Save,
    Loader2, AlertCircle, CheckCircle2,
    Lock, Shield, Camera, Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("auth_token");

        if (!storedUser || !token) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            phone: parsedUser.phone || "",
            address: parsedUser.address || "",
        });
        setLoading(false);
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setError("");
        setSuccess(false);

        try {
            const response = await api.post("/user/update-profile", formData);
            if (response.data.success) {
                setSuccess(true);
                const updatedUser = { ...user, ...response.data.user };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update profile. Please try again.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Profile Settings</h2>
                    <p className="text-slate-500 font-medium italic">Manage your personal information and preferences</p>
                </div>

                <div className="space-y-8">
                    {/* Profile Photo Card */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className="flex items-center space-x-8">
                            <div className="relative group cursor-pointer">
                                <div className="h-28 w-28 rounded-[36px] bg-slate-50 border-2 border-slate-100 overflow-hidden flex items-center justify-center transition-all group-hover:border-red-600/30">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <User size={48} className="text-slate-200" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-[36px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <Camera size={28} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-[#003366] uppercase tracking-[0.2em] text-xs">Profile Picture</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                            </div>
                        </div>
                        <Button onClick={() => { /* TODO: avatar upload */ alert('Avatar upload coming soon!'); }} className="bg-white hover:bg-slate-50 text-[#003366] border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-none transition-all">Upload New</Button>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                        <div className="mb-10">
                            <h3 className="font-black text-[#003366] uppercase tracking-widest text-xs">Personal Information</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center">
                                <span className="w-6 h-px bg-slate-200 mr-2" />
                                Update your personal details and how we contact you.
                            </p>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-red-50 border border-red-100 text-red-700 rounded-[24px] flex items-center shadow-lg shadow-red-600/5">
                                <AlertCircle size={20} className="mr-4 flex-shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight">{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-6 bg-green-50 border border-green-100 text-green-700 rounded-[24px] flex items-center shadow-lg shadow-green-600/5">
                                <CheckCircle2 size={20} className="mr-4 flex-shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-tight">Profile successfully updated!</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 block">Full Name</Label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-focus-within:border-red-600/30 transition-all">
                                            <User className="text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                        </div>
                                        <Input id="name" type="text" required value={formData.name} onChange={handleChange} className="pl-20 py-6 h-auto bg-slate-50/50 border-slate-200 rounded-3xl focus:ring-[12px] focus:ring-red-600/5 focus:border-red-600 transition-all font-bold text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 block">Email Address</Label>
                                    <div className="relative group opacity-80">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                                            <Mail className="text-slate-400" size={18} />
                                        </div>
                                        <Input id="email" type="email" required disabled value={formData.email} className="pl-20 py-6 h-auto bg-slate-50/10 border-slate-100 rounded-3xl cursor-not-allowed font-bold text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 block">Phone Number</Label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-focus-within:border-red-600/30 transition-all">
                                            <Phone className="text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                        </div>
                                        <Input id="phone" type="tel" required value={formData.phone} onChange={handleChange} className="pl-20 py-6 h-auto bg-slate-50/50 border-slate-200 rounded-3xl focus:ring-[12px] focus:ring-red-600/5 focus:border-red-600 transition-all font-bold text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 block">Account Statistics</Label>
                                    <div className="px-6 py-5 h-auto bg-slate-50/30 border border-slate-100 rounded-3xl flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gold Member</span>
                                        </div>
                                        <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest bg-white px-4 py-2 border border-slate-100 rounded-xl shadow-sm">Since Jan 2026</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 block">Physical Address</Label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-6 w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-focus-within:border-red-600/30 transition-all">
                                        <MapPin className="text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                    </div>
                                    <textarea id="address" required value={formData.address} onChange={handleChange} className="w-full pl-20 pr-8 py-6 h-40 bg-slate-50/50 border border-slate-200 rounded-[32px] focus:outline-none focus:ring-[12px] focus:ring-red-600/5 focus:border-red-600 transition-all text-sm font-bold resize-none" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-8">
                                <Button type="submit" disabled={updating} className="bg-[#003366] text-white h-16 rounded-[20px] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 shadow-2xl shadow-blue-900/10 transition-all flex items-center justify-center px-12 transform hover:-translate-y-1">
                                    {updating ? <Loader2 className="animate-spin mr-3" size={20} /> : <Save className="mr-3" size={20} />} Update My Profile
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
