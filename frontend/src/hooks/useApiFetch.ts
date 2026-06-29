"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface UseApiFetchOptions<T> {
    initialData?: T;
    transform?: (data: any) => T;
    enabled?: boolean;
}

interface UseApiFetchReturn<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useApiFetch<T>(
    url: string | null,
    options: UseApiFetchOptions<T> = {}
): UseApiFetchReturn<T> {
    const { initialData = null, transform, enabled = true } = options;
    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!url || !enabled) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(url);
            const rawData = response.data?.data ?? response.data?.posts ?? response.data;
            setData(transform ? transform(rawData) : rawData);
        } catch (err: any) {
            const message =
                err.response?.data?.message || "Failed to fetch data";
            setError(message);
            console.error(`API fetch error [${url}]:`, err);
        } finally {
            setLoading(false);
        }
    }, [url, enabled, transform]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
