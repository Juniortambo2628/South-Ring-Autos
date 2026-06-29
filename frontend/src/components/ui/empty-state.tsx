"use client";

import { ClipboardList } from "lucide-react";

interface EmptyStateProps {
    icon?: React.ComponentType<any>;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({
    icon: Icon = ClipboardList,
    title = "No data found",
    description = "There are no items to display at this time.",
    action,
}: EmptyStateProps) {
    return (
        <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                <Icon size={32} />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
            <p className="text-[10px] text-slate-400 font-medium">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
