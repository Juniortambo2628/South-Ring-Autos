"use client";

import { Loader2 } from "lucide-react";

interface AdminPageHeaderProps {
    badge: string;
    badgeColor?: string;
    title: string;
    subtitle: string;
    stats?: { label: string; value: string | number; color?: string }[];
}

export function AdminPageHeader({
    badge,
    badgeColor = "purple",
    title,
    subtitle,
    stats,
}: AdminPageHeaderProps) {
    const colorMap: Record<string, string> = {
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <div className="flex items-center space-x-2 mb-2">
                    <span
                        className={`px-3 py-1 ${
                            colorMap[badgeColor] || colorMap.purple
                        } text-[9px] font-black uppercase tracking-[0.2em] rounded-full border`}
                    >
                        {badge}
                    </span>
                </div>
                <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
                    {title}
                </h2>
                <p className="text-slate-500 font-medium italic">{subtitle}</p>
            </div>
            {stats && stats.length > 0 && (
                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center min-w-[120px] flex-shrink-0"
                        >
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <p
                                className={`text-2xl font-black ${
                                    stat.color || "text-[#003366]"
                                }`}
                            >
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

interface AdminLoadingProps {
    message?: string;
}

export function AdminLoading({ message = "Loading..." }: AdminLoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {message}
            </p>
        </div>
    );
}

interface AdminEmptyProps {
    icon?: React.ReactNode;
    message?: string;
}

export function AdminEmpty({ icon, message = "No Items Found" }: AdminEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
            {icon}
            <p className="text-sm font-black text-[#003366] uppercase tracking-widest mt-4">
                {message}
            </p>
        </div>
    );
}
