"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { motion } from "framer-motion";
import { BookOpen, Calendar, CheckCircle2, Lock, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";
export default function JournalDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = useParams();
    const router = useRouter();
    const [journal, setJournal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Load Paystack inline JS
        if (typeof window !== "undefined" && !window.PaystackPop) {
            const script = document.createElement("script");
            script.src = "https://js.paystack.co/v2/inline.js";
            script.async = true;
            script.onload = () => setScriptLoaded(true);
            document.head.appendChild(script);
        } else {
            setScriptLoaded(true);
        }

        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));

        fetchJournal();
    }, [params.id]);

    const fetchJournal = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/journals/${params.id}`);
            setJournal(res.data.data);
        } catch (err) {
            console.error("Failed to fetch journal details", err);
            setNotification({ type: "error", message: "Could not load journal details." });
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
            return;
        }

        if (!window.PaystackPop) {
            setNotification({ type: "error", message: "Payment script still loading. Please wait a moment." });
            return;
        }

        setPurchasing(true);
        try {
            // 1. Initiate purchase on backend
            const initRes = await api.post("/journals/purchase", {
                journal_id: journal.id,
                payment_method: "paystack"
            });

            if (!initRes.data.success) {
                setNotification({ type: "error", message: initRes.data.message || "Failed to initialize purchase." });
                setPurchasing(false);
                return;
            }

            const { payment_id, amount } = initRes.data.data;

            // 2. Initialize Paystack transaction
            const payRes = await api.post("/payments/paystack/initialize", {
                payment_id: payment_id
            });

            if (!payRes.data.success) {
                setNotification({ type: "error", message: payRes.data.message || "Failed to initialize payment gateway." });
                setPurchasing(false);
                return;
            }

            const { access_code, reference } = payRes.data.data;

            // 3. Get Public Key
            const keyRes = await api.get("/payments/paystack/public-key");
            const publicKey = keyRes.data.data?.public_key;

            if (!publicKey) {
                setNotification({ type: "error", message: "Payment gateway is not configured." });
                setPurchasing(false);
                return;
            }

            // 4. Open Paystack popup
            const popup = new window.PaystackPop();
            popup.newTransaction({
                key: publicKey,
                accessCode: access_code,
                onSuccess: async (transaction: any) => {
                    setNotification({ type: "success", message: "Payment successful! Verifying access..." });
                    try {
                        // Verify on backend
                        await api.get(`/payments/paystack/verify?reference=${reference}`);
                        // Reload journal data to show "Read" button
                        fetchJournal();
                    } catch (e) {
                        console.error("Verification failed, but access might be granted via webhook later", e);
                        setNotification({ type: "success", message: "Payment confirmed. Access will be granted shortly." });
                    }
                },
                onCancel: () => {
                    setPurchasing(false);
                },
            });

        } catch (error: any) {
            console.error("Purchase failed", error);
            const message = error.response?.data?.message || "Failed to process purchase. Please try again.";
            setNotification({ type: "error", message });
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!journal) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center py-20">
                    <h2 className="text-2xl font-black text-[#003366] mb-4">JOURNAL NOT FOUND</h2>
                    <Link href="/journal" className="text-red-600 font-bold flex items-center">
                        <ArrowLeft size={16} className="mr-2" /> Back to Journals
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />

            {notification && (
                <div className={`fixed top-24 right-6 z-[100] max-w-sm px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 animate-in slide-in-from-right ${notification.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    }`}>
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}
            <main className="flex-grow">
                <PageHero
                    title={journal.title}
                    subtitle={`Annual Edition – ${journal.year}`}
                    breadcrumb={[
                        { label: "JOURNAL", href: "/journal" },
                        { label: journal.year, href: `/journal/${journal.id}` }
                    ]}
                />

                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-16">
                            {/* Left: Cover & Highlights */}
                            <div className="lg:w-1/3">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="sticky top-32"
                                >
                                    <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-10 overflow-hidden">
                                        <img
                                            src={journal.cover_image ? `${ASSET}${journal.cover_image}` : `${ASSET}/images/placeholders/journal-cover.jpg`}
                                            alt={journal.title}
                                            className="w-full rounded-[2rem] shadow-inner object-cover"
                                        />
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">What's Included</h4>
                                        <ul className="space-y-4">
                                            {[
                                                'Full year of technical articles',
                                                'Seasonal maintenance checklists',
                                                'Expert industry news analysis',
                                                'High-resolution photography',
                                                'Exclusive technical deep-dives'
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-start space-x-3 text-sm font-medium text-slate-600">
                                                    <CheckCircle2 size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Right: Content & Action */}
                            <div className="lg:w-2/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center space-x-3 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] mb-6">
                                        <BookOpen size={16} />
                                        <span>Official Publication</span>
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-black text-[#003366] mb-8 uppercase tracking-tighter leading-[0.9]">
                                        Unlock the <span className="text-red-600">{journal.year}</span> Automotive Compendium
                                    </h2>

                                    <div className="prose prose-slate max-w-none mb-12">
                                        <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
                                            {journal.description || 'Dive into a year of automotive expertise. This journal compiles all our insights, advice, and industry news from the entire year into one cohesive digital experience.'}
                                        </p>
                                    </div>

                                    <div className="bg-[#003366] rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-2">Annual Access Pass</div>
                                                <div className="text-5xl font-black mb-4 flex items-baseline">
                                                    <span className="text-xl mr-2 text-blue-300">KES</span>
                                                    {parseFloat(journal.price).toLocaleString()}
                                                </div>
                                                <p className="text-blue-100/60 text-xs font-medium max-w-[280px]">
                                                    {journal.has_access
                                                        ? `You have unrestricted access to all ${journal.year} articles.`
                                                        : `One-time payment for lifetime digital access to all ${journal.year} articles.`}
                                                </p>
                                            </div>

                                            {journal.has_access ? (
                                                <Link
                                                    href={`/journal/${journal.id}/read`}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1 active:scale-95 group"
                                                >
                                                    <BookOpen size={16} className="mr-2 group-hover:scale-110 transition-transform" />
                                                    Read Journal
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={handlePurchase}
                                                    disabled={purchasing}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                                                >
                                                    {purchasing ? (
                                                        <Loader2 size={16} className="animate-spin mr-2" />
                                                    ) : (
                                                        <ShoppingCart size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
                                                    )}
                                                    Secure Purchase Now
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-start space-x-6">
                                            <div className="bg-red-600/10 p-4 rounded-2xl">
                                                <Lock size={24} className="text-red-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-[#003366] uppercase text-[10px] tracking-widest mb-2">Secure Access</h5>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                                    Content protection ensures exclusive viewing rights for registered purchasers only.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-3xl border border-dashed border-slate-200 flex items-start space-x-6">
                                            <div className="bg-blue-600/10 p-4 rounded-2xl">
                                                <BookOpen size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-[#003366] uppercase text-[10px] tracking-widest mb-2">Digital Edition</h5>
                                                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                                                    Optimized for mobile, tablet, and desktop viewing experience.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
