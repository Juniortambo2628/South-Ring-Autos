"use client";

import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

declare global {
    interface Window {
        PaystackPop: any;
    }
}

interface PaystackButtonProps {
    paymentId: number;
    amount: number;
    invoiceNumber: string;
    onSuccess: () => void;
    onClose?: () => void;
    className?: string;
}

export default function PaystackButton({
    paymentId,
    amount,
    invoiceNumber,
    onSuccess,
    onClose,
    className,
}: PaystackButtonProps) {
    const [loading, setLoading] = useState(false);
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
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Initialize transaction on backend
            const res = await api.post("/payments/paystack/initialize", {
                payment_id: paymentId,
            });

            if (!res.data.success) {
                alert(res.data.message || "Failed to initialize payment");
                setLoading(false);
                return;
            }

            const { access_code, reference } = res.data.data;

            // 2. Get public key
            const keyRes = await api.get("/payments/paystack/public-key");
            const publicKey = keyRes.data.data?.public_key;

            if (!publicKey) {
                alert("Payment gateway is not configured. Please contact the administrator.");
                setLoading(false);
                return;
            }

            // 3. Open Paystack popup
            if (!window.PaystackPop) {
                alert("Payment script not loaded. Please refresh the page.");
                setLoading(false);
                return;
            }

            const popup = new window.PaystackPop();
            popup.newTransaction({
                key: publicKey,
                accessCode: access_code,
                onSuccess: async (transaction: any) => {
                    // 4. Verify on backend
                    try {
                        await api.get(`/payments/paystack/verify?reference=${reference}`);
                    } catch (e) {
                        console.error("Verify call failed, webhook will handle it", e);
                    }
                    onSuccess();
                    setLoading(false);
                },
                onCancel: () => {
                    onClose?.();
                    setLoading(false);
                },
            });
        } catch (err: any) {
            console.error("Payment error", err);
            alert(err.response?.data?.message || "Failed to start payment. Please try again.");
            setLoading(false);
        }
    };

    const formatCurrency = (amt: number) =>
        new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amt);

    return (
        <Button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded}
            className={
                className ||
                "bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-red-600/20"
            }
        >
            {loading ? (
                <span className="flex items-center">
                    <Loader2 className="mr-2 animate-spin" size={14} />
                    Processing...
                </span>
            ) : (
                <span className="flex items-center">
                    <CreditCard size={14} className="mr-2" />
                    Pay {formatCurrency(amount)}
                </span>
            )}
        </Button>
    );
}
