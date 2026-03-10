"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Phone, MapPin, UserPlus, AlertCircle, Loader2, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/register", formData);
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <div className="min-h-[90vh] flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl -ml-48 -mb-48" />

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl">
                        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
                            <div className="text-center mb-10">
                                <div className="flex justify-center mb-6">
                                    <img src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="South Ring Autos" className="h-16 w-auto object-contain" />
                                </div>
                                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-2">Create Your Account</h2>
                                <p className="text-slate-500 font-medium italic">Join the South Ring Autos family for expert car care</p>
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
                                    <h4 className="font-black uppercase tracking-widest text-sm mb-1">Registration Successful!</h4>
                                    <p className="text-xs font-medium">Redirecting you to login...</p>
                                </motion.div>
                            )}

                            {!success && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</Label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                                <Input id="name" type="text" required value={formData.name} onChange={handleChange} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="John Doe" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                                <Input id="email" type="email" required value={formData.email} onChange={handleChange} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="john@example.com" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                                <Input id="password" type="password" required value={formData.password} onChange={handleChange} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Password</Label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                                <Input id="password_confirmation" type="password" required value={formData.password_confirmation} onChange={handleChange} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="••••••••" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1 flex items-start space-x-3">
                                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-600" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
                                            I agree to the <a href="#" className="text-red-600 hover:underline">Terms of Service</a> and <a href="#" className="text-red-600 hover:underline">Privacy Policy</a> regarding my personal data and vehicle information.
                                        </p>
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full bg-[#003366] text-white py-5 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-900 shadow-xl shadow-blue-900/10 transition-all flex items-center justify-center">
                                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />} Create Account
                                    </Button>

                                    <div className="relative my-8 text-center">
                                        <hr className="border-slate-100" />
                                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or sign up with</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => (window.location.href = `${ASSET}/api/auth/google`)}
                                        className="w-full flex items-center justify-center space-x-3 py-4 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest text-slate-700 shadow-sm"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                </form>
                            )}

                            <div className="mt-10 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Already have an account? <Link href="/login" className="text-red-600 hover:text-red-700 transition-colors underline decoration-2 underline-offset-4">Sign In</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
