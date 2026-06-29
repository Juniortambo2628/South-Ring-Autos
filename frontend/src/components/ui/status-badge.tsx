"use client";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    confirmed: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    cancelled: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    failed: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    unread: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    read: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-100" },
    draft: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    published: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    requested: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    scheduled: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    active: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    inactive: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-100" },
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const colors = STATUS_COLORS[status.toLowerCase()] ?? {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-100",
    };

    return (
        <span
            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
        >
            {status}
        </span>
    );
}
