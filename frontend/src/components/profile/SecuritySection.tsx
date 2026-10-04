"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck, KeyRound, Plus, Trash2, Copy, Loader2,
    AlertCircle, CheckCircle2, Smartphone, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { createPasskey, isPasskeyCancelled } from "@/lib/webauthn";

type Passkey = {
    id: string;
    alias: string | null;
    created_at: string;
};

export default function SecuritySection({ user, onUserUpdated }: {
    user: any;
    onUserUpdated: (patch: Record<string, any>) => void;
}) {
    const [twoFactorOn, setTwoFactorOn] = useState<boolean>(!!user?.two_factor_enabled);
    const [setup, setSetup] = useState<{ secret: string; otpauth_url: string } | null>(null);
    const [qrImage, setQrImage] = useState("");
    const [tfCode, setTfCode] = useState("");
    const [tfBusy, setTfBusy] = useState(false);
    const [tfError, setTfError] = useState("");
    const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
    const [copied, setCopied] = useState(false);
    const [disableOpen, setDisableOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState("");
    const [regenOpen, setRegenOpen] = useState(false);
    const [regenCode, setRegenCode] = useState("");

    const [passkeys, setPasskeys] = useState<Passkey[]>([]);
    const [passkeysLoading, setPasskeysLoading] = useState(true);
    const [passkeyName, setPasskeyName] = useState("");
    const [addingPasskey, setAddingPasskey] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [pkError, setPkError] = useState("");

    const loadPasskeys = useCallback(async () => {
        try {
            const response = await api.get("/passkeys");
            setPasskeys(response.data.passkeys || []);
        } catch (err: any) {
            setPkError(err.response?.data?.message || "Could not load passkeys.");
        } finally {
            setPasskeysLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPasskeys();
    }, [loadPasskeys]);

    const runTf = async (action: () => Promise<any>, onSuccess?: () => void) => {
        setTfBusy(true);
        setTfError("");
        try {
            await action();
            onSuccess?.();
        } catch (err: any) {
            setTfError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setTfBusy(false);
        }
    };

    const startEnable = () => runTf(async () => {
        const response = await api.post("/two-factor/enable");
        const QRCode = (await import("qrcode")).default;
        const image = await QRCode.toDataURL(response.data.otpauth_url, { margin: 1, width: 240 });
        setQrImage(image);
        setSetup({ secret: response.data.secret, otpauth_url: response.data.otpauth_url });
        setRecoveryCodes(null);
    });

    const confirmEnable = () => runTf(async () => {
        const response = await api.post("/two-factor/confirm", { code: tfCode });
        setRecoveryCodes(response.data.recovery_codes);
        setSetup(null);
        setTfCode("");
        setTwoFactorOn(true);
        onUserUpdated({ two_factor_enabled: true });
    });

    const disable = () => runTf(async () => {
        await api.post("/two-factor/disable", { password: disablePassword });
        setTwoFactorOn(false);
        setDisableOpen(false);
        setDisablePassword("");
        setRecoveryCodes(null);
        onUserUpdated({ two_factor_enabled: false });
    });

    const regenerate = () => runTf(async () => {
        const response = await api.post("/two-factor/recovery-codes", { code: regenCode });
        setRecoveryCodes(response.data.recovery_codes);
        setRegenOpen(false);
        setRegenCode("");
    });

    const copyCodes = async () => {
        if (!recoveryCodes) return;
        await navigator.clipboard.writeText(recoveryCodes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const addPasskey = async () => {
        setAddingPasskey(true);
        setPkError("");
        try {
            const options = await api.post("/passkeys/register/options");
            const credential = await createPasskey(options.data);
            await api.post("/passkeys/register", {
                alias: passkeyName.trim() || undefined,
                ...credential,
            });
            setPasskeyName("");
            await loadPasskeys();
        } catch (err: any) {
            if (isPasskeyCancelled(err)) {
                setPkError("Passkey creation was cancelled.");
            } else {
                setPkError(err.response?.data?.message || "Could not register the passkey.");
            }
        } finally {
            setAddingPasskey(false);
        }
    };

    const deletePasskey = async (id: string) => {
        if (!window.confirm("Remove this passkey? You will not be able to sign in with it.")) return;
        setDeletingId(id);
        setPkError("");
        try {
            await api.delete(`/passkeys/${id}`);
            setPasskeys((current) => current.filter((key) => key.id !== id));
        } catch (err: any) {
            setPkError(err.response?.data?.message || "Could not remove the passkey.");
        } finally {
            setDeletingId("");
        }
    };

    return (
        <div className="space-y-8">
            {tfError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50 border border-red-100 text-red-700 rounded-[24px] flex items-center shadow-lg shadow-red-600/5">
                    <AlertCircle size={20} className="mr-4 flex-shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-tight">{tfError}</span>
                </motion.div>
            )}

            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                <div className="mb-8">
                    <h3 className="font-black text-[#003366] uppercase tracking-widest text-xs">Two-Factor Authentication</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center">
                        <span className="w-6 h-px bg-slate-200 mr-2" />
                        Protect your account with an authenticator app and recovery codes.
                    </p>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50/60 border border-slate-100 rounded-3xl">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${twoFactorOn ? "bg-green-50 border-green-100" : "bg-white border-slate-100"}`}>
                            <ShieldCheck size={22} className={twoFactorOn ? "text-green-600" : "text-slate-400"} />
                        </div>
                        <div>
                            <p className="font-black text-[#003366] uppercase tracking-[0.2em] text-xs">
                                {twoFactorOn ? "Two-factor is ON" : "Two-factor is OFF"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {twoFactorOn ? "Sign-ins require a code from your app" : "Add a second step when you sign in"}
                            </p>
                        </div>
                    </div>
                    {twoFactorOn ? (
                        <Button onClick={() => setDisableOpen(!disableOpen)} className="bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-none">Disable</Button>
                    ) : (
                        <Button onClick={startEnable} disabled={tfBusy} className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-none">
                            {tfBusy ? <Loader2 className="animate-spin" size={16} /> : "Enable"}
                        </Button>
                    )}
                </div>

                {setup && (
                    <div className="mt-8 p-8 border border-slate-100 rounded-3xl">
                        <p className="font-black text-[#003366] uppercase tracking-[0.2em] text-xs mb-6">Step 1: Scan with your authenticator app</p>
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                            {qrImage && <img src={qrImage} alt="Two-factor QR code" className="w-52 h-52 rounded-2xl border border-slate-100 self-center md:self-start" />}
                            <div className="space-y-4 text-sm">
                                <p className="text-slate-500 font-medium">Can&apos;t scan? Enter this key manually in your app:</p>
                                <code className="block break-all bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-[#003366] select-all">{setup.secret}</code>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="font-black text-[#003366] uppercase tracking-[0.2em] text-xs mb-4">Step 2: Enter the 6-digit code to confirm</p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={tfCode}
                                    onChange={(e) => setTfCode(e.target.value.replace(/\D/g, ""))}
                                    className="sm:w-56 text-center text-lg font-black tracking-[0.4em] bg-slate-50/50 border-slate-200 rounded-2xl"
                                    placeholder="000000"
                                />
                                <Button onClick={confirmEnable} disabled={tfBusy || tfCode.length !== 6} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-none">
                                    {tfBusy ? <Loader2 className="animate-spin" size={16} /> : "Confirm & Activate"}
                                </Button>
                                <Button onClick={() => { setSetup(null); setTfCode(""); }} variant="outline" className="rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-12 border-slate-200 text-slate-500">Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}

                {recoveryCodes && (
                    <div className="mt-8 p-8 border border-amber-100 bg-amber-50/50 rounded-3xl">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="font-black text-amber-700 uppercase tracking-[0.2em] text-xs">Save your recovery codes</p>
                                <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest mt-2">
                                    Each code works once if you lose access to your app. Store them somewhere safe — they won&apos;t be shown again.
                                </p>
                            </div>
                            <Button onClick={copyCodes} className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest px-5 h-10 shadow-none">
                                {copied ? <CheckCircle2 size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}{copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {recoveryCodes.map((code) => (
                                <code key={code} className="bg-white border border-amber-100 rounded-lg px-3 py-2 text-center text-xs font-black text-[#003366]">{code}</code>
                            ))}
                        </div>
                        <Button onClick={() => setRecoveryCodes(null)} className="mt-6 bg-[#003366] hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-none">
                            I&apos;ve saved them
                        </Button>
                    </div>
                )}

                {twoFactorOn && !recoveryCodes && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        {!regenOpen ? (
                            <Button onClick={() => { setRegenOpen(true); setDisableOpen(false); }} variant="outline" className="rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-11 border-slate-200 text-slate-500">Regenerate recovery codes</Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-3 p-4 border border-slate-100 rounded-2xl w-full">
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={regenCode}
                                    onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, ""))}
                                    className="sm:w-52 text-center font-black tracking-[0.4em] bg-slate-50/50 border-slate-200 rounded-xl"
                                    placeholder="000000"
                                />
                                <Button onClick={regenerate} disabled={tfBusy || regenCode.length !== 6} className="bg-[#003366] hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 h-11 shadow-none">
                                    {tfBusy ? <Loader2 className="animate-spin" size={14} /> : "Generate new codes"}
                                </Button>
                                <Button onClick={() => { setRegenOpen(false); setRegenCode(""); }} variant="outline" className="rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-11 border-slate-200 text-slate-500">Cancel</Button>
                            </div>
                        )}
                    </div>
                )}

                {disableOpen && (
                    <div className="mt-6 p-6 border border-red-100 bg-red-50/40 rounded-3xl">
                        <p className="font-black text-red-600 uppercase tracking-[0.2em] text-xs mb-4 flex items-center"><Lock size={14} className="mr-2" />Confirm your password to disable 2FA</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                className="sm:w-72 bg-white border-slate-200 rounded-xl"
                                placeholder="Your password"
                            />
                            <Button onClick={disable} disabled={tfBusy || !disablePassword} className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-6 h-11 shadow-none">
                                {tfBusy ? <Loader2 className="animate-spin" size={14} /> : "Disable 2FA"}
                            </Button>
                            <Button onClick={() => { setDisableOpen(false); setDisablePassword(""); }} variant="outline" className="rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-11 border-slate-200 text-slate-500">Cancel</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
                <div className="mb-8">
                    <h3 className="font-black text-[#003366] uppercase tracking-widest text-xs">Passkeys</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center">
                        <span className="w-6 h-px bg-slate-200 mr-2" />
                        Sign in with Face ID, a fingerprint, or your device PIN instead of a password.
                    </p>
                </div>

                {pkError && (
                    <div className="mb-6 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center shadow-sm">
                        <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-tight">{pkError}</span>
                    </div>
                )}

                <div className="space-y-3">
                    {passkeysLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-slate-300" size={24} /></div>
                    ) : passkeys.length === 0 ? (
                        <div className="py-8 text-center">
                            <Smartphone size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No passkeys yet</p>
                        </div>
                    ) : (
                        passkeys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-5 bg-slate-50/60 border border-slate-100 rounded-2xl">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                                        <KeyRound size={18} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#003366] uppercase tracking-[0.15em] text-xs">{key.alias || "Passkey"}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            Added {new Date(key.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={() => deletePasskey(key.id)} disabled={deletingId === key.id} className="bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-10 shadow-none">
                                    {deletingId === key.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <Input
                        value={passkeyName}
                        onChange={(e) => setPasskeyName(e.target.value)}
                        className="sm:w-72 bg-slate-50/50 border-slate-200 rounded-2xl"
                        placeholder="Name this device (optional)"
                        maxLength={40}
                    />
                    <Button onClick={addPasskey} disabled={addingPasskey} className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest px-6 h-12 shadow-none">
                        {addingPasskey ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={16} className="mr-2" />}Add Passkey
                    </Button>
                </div>
            </div>
        </div>
    );
}
