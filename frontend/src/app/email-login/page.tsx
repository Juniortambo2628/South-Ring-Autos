"use client";

import PublicShell from "@/components/landing/PublicShell";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { completeLogin } from "@/lib/auth";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function EmailLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState<"email" | "code">("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    const requestCode = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError("");
        setInfo("");
        try {
            const response = await api.post("/email-code/send", { email });
            setInfo(response.data.message);
            setStep("code");
        } catch (err: any) {
            setError(err.response?.data?.message || "Could not send the code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/email-code/login", { email, code });
            if (!completeLogin(router, response.data)) {
                setError(response.data.message || "Invalid or expired sign-in code.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired sign-in code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicShell>
            <main className="flex-grow">
                <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl -ml-48 -mb-48" />

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20">
                            <div className="text-center mb-10">
                                <div className="flex justify-center mb-6">
                                    <img src={`${ASSET}/images/South-ring-logos/SR-Logo-Transparent-BG.png`} alt="South Ring Autos" className="h-20 w-auto object-contain" />
                                </div>
                                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-2">Sign In With Email Code</h2>
                                <p className="text-slate-500 font-medium italic">
                                    {step === "email" ? "We'll email you a one-time sign-in code" : `We emailed a code to ${email}`}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center shadow-sm">
                                    <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            )}

                            {info && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center shadow-sm">
                                    <Mail size={20} className="mr-3 flex-shrink-0" />
                                    <span className="text-sm font-bold">{info}</span>
                                </div>
                            )}

                            {step === "email" ? (
                                <form onSubmit={requestCode} className="space-y-6">
                                    <div>
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600" placeholder="you@example.com" />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-4 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 shadow-xl shadow-red-600/20">
                                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Mail className="mr-2" size={18} />}Send My Code
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Sign-In Code</Label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                            <Input
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                required
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                                className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 text-center text-lg font-black tracking-[0.5em]"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={loading || code.length !== 6} className="w-full bg-red-600 text-white py-4 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 shadow-xl shadow-red-600/20">
                                        {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <KeyRound className="mr-2" size={18} />}Sign In
                                    </Button>
                                    <div className="flex items-center justify-between px-1">
                                        <button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider flex items-center">
                                            <ArrowLeft size={14} className="mr-1" /> Back
                                        </button>
                                        <button type="button" onClick={() => requestCode()} disabled={loading} className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider disabled:opacity-50">
                                            Resend code
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-10 text-center">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    Prefer your password? <Link href="/login" className="text-red-600 hover:text-red-700 transition-colors underline decoration-2 underline-offset-4">Back to Login</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </PublicShell>
    );
}
