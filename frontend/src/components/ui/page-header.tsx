"use client";

interface PageHeaderProps {
    badge?: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function PageHeader({ badge, title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                {badge && (
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">
                            {badge}
                        </span>
                    </div>
                )}
                <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">{title}</h2>
                {description && <p className="text-slate-500 font-medium italic">{description}</p>}
            </div>
            {action && <div className="flex items-center space-x-3">{action}</div>}
        </div>
    );
}
