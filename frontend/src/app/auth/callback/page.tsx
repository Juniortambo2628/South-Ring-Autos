"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const userStr = searchParams.get("user");

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                
                // Store in localStorage
                localStorage.setItem("auth_token", token);
                localStorage.setItem("user", JSON.stringify(user));

                // Success redirect logic
                if (!user.profile_completed) {
                    router.push("/complete-profile");
                } else if (user.role === "admin") {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            } catch (error) {
                console.error("Failed to parse user data", error);
                router.push("/login?error=auth_callback_failed");
            }
        } else {
            router.push("/login?error=auth_callback_missing_data");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                Finalizing Secure Authentication...
            </p>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-red-600 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Loading Authentication...
                </p>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
