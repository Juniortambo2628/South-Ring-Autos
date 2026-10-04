"use client";

import PublicShell from "@/components/landing/PublicShell";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, AlertCircle, Loader2, ShieldCheck, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { completeLogin } from "@/lib/auth";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

export default function TwoFactorPage() {
    const router = useRouter();
    const [challengeToken, setChallengeToken] = useState("");
    const [code, setCode] = useState("");
    const [useRecovery, setUseRecovery] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = sessionStorage.getItem("login_challenge");
        if (!token) {
            router.replace("/login");
            return;
        }
        setChallengeToken(token);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/two-factor/challenge", {
                challenge_token: challengeToken,
                code,
            });
            sessionStorage.removeItem("login_challenge");
            if (!completeLogin(router, response.data)) {
                setError(response.data.message || "The code is invalid.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "The code is invalid.");
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
                                <div className="flex justify-center mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
                                        <ShieldCheck size={26} className="text-red-600" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-black text-[#003366] uppercase tracking-tighter mb-2">Two-Factor Authentication</h2>
                                <p className="text-slate-500 font-medium italic">
                                    {useRecovery ? "Enter one of your recovery codes" : "Enter the 6-digit code from your authenticator app"}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center shadow-sm">
                                    <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                        {useRecovery ? "Recovery Code" : "Authentication Code"}
                                    </Label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                        <Input
                                            required
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className={`pl-12 py-4 h-auto bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-600/10 focus:border-red-600 font-black ${useRecovery ? "" : "text-center text-lg tracking-[0.5em]"}`}
                                            placeholder={useRecovery ? "abcd-efgh" : "000000"}
                                            autoComplete="one-time-code"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading || !code || !challengeToken} className="w-full bg-red-600 text-white py-4 h-auto rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 shadow-xl shadow-red-600/20">
                                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <ShieldCheck className="mr-2" size={18} />}Verify &amp; Sign In
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => { setUseRecovery(!useRecovery); setCode(""); setError(""); }}
                                    className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest flex items-center justify-center mx-auto"
                                >
                                    <LifeBuoy size={14} className="mr-2" />
                                    {useRecovery ? "Use my authenticator app instead" : "Use a recovery code instead"}
                                </button>
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    <Link href="/login" className="text-red-600 hover:text-red-700 transition-colors underline decoration-2 underline-offset-4">Back to Login</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </PublicShell>
    );
}
