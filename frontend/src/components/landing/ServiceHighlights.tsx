import { ShieldCheck, Users, Wrench } from "lucide-react";
import Link from "next/link";

const highlights = [
    { icon: ShieldCheck, title: "Transparent Pricing", desc: "Honest estimates and itemised invoices — no hidden charges. We believe in clear invoices with full transparency.", link: "/about" },
    { icon: Users, title: "Expert Technicians", desc: "Trained staff with access to specialists for complex jobs. Over 500 satisfied customers since opening.", link: "/services", bg: "bg-[#f8f9fa]" },
    { icon: Wrench, title: "Material Guarantee", desc: "We use proper equipment and ECU diagnostics so problems get fixed right the first time every single time.", link: "/services" },
];

export default function ServiceHighlights() {
    return (
        <div className="container mx-auto px-4 -mt-12 relative z-20 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl overflow-hidden shadow-none border border-slate-100">
                {highlights.map((h) => (
                    <div key={h.title} className={`${h.bg || "bg-white"} p-10 border-r border-slate-100 flex flex-col items-center text-center group hover:bg-slate-50 transition-all duration-300`}>
                        <div className="text-red-600 mb-6 transform group-hover:scale-110 transition-transform">
                            <h.icon size={56} strokeWidth={1.5} />
                        </div>
                        <h5 className="text-xl font-black mb-4 text-slate-900 uppercase tracking-tight">{h.title}</h5>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">{h.desc}</p>
                        <Link href={h.link} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-200 hover:text-red-600 hover:border-red-600 transition-all pb-1">
                            Read More
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
