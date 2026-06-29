"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { User } from "@/types";

interface UseAuthReturn {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => void;
}

export function useAuth(): UseAuthReturn {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const refreshUser = useCallback(() => {
        if (typeof window === "undefined") return;
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/logout");
        } catch {
            // Ignore errors on logout
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            router.push("/login");
        }
    }, [router]);

    return {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "admin",
        loading,
        logout,
        refreshUser,
    };
}
