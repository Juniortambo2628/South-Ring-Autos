"use client";

import PublicShell from "@/components/landing/PublicShell";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { completeLogin } from "@/lib/auth";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    useEffect(() => {
        if (!email) router.replace("/login");
    }, [email, router]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setError("");
        setInfo("");
        try {
            const response = await api.post("/verify-email", { email, code });
            if (!completeLogin(router, response.data)) {
                setError(response.data.message || "Verification failed. Please try again.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired verification code.");
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError("");
        setInfo("");
        try {
            const response = await api.post("/verify-email/send", { email, password });
            setInfo(response.data.message || "A new verification code has been sent.");
            setPassword("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Could not resend the code.");
        } finally {
            setResending(false);
        }
    };

    return (
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
                            <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-2">Verify Your Email</h2>
                            <p className="text-slate-500 font-medium italic">Enter the 6-digit code we emailed to {email || "your inbox"}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center shadow-sm">
                                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {info && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center shadow-sm">
                                <CheckCircle2 size={20} className="mr-3 flex-shrink-0" />
                                <span className="text-sm font-bold">{info}</span>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Verification Code</Label>
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

                            <Button type="submit" disabled={verifying || code.length !== 6} className="w-full bg-red-600 text-white py-4 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 shadow-xl shadow-red-600/20">
                                {verifying ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldCheck className="mr-2" size={18} />}Verify Account
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Didn&apos;t get the code?</p>
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={18} />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600"
                                        placeholder="Your password (to resend)"
                                    />
                                </div>
                                <Button type="button" onClick={handleResend} disabled={resending || !password} variant="outline" className="w-full py-4 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
                                    {resending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}Resend Code
                                </Button>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Wrong account? <Link href="/login" className="text-red-600 hover:text-red-700 transition-colors underline decoration-2 underline-offset-4">Back to Login</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <PublicShell>
            <Suspense fallback={null}>
                <VerifyEmailContent />
            </Suspense>
        </PublicShell>
    );
}
