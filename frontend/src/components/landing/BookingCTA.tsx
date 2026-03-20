import { Clock, ShieldCheck, Wrench, UserPlus } from "lucide-react";
import Link from "next/link";

export default function BookingCTA({ content }: { content?: any }) {
    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-fixed bg-center" style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_ASSET_URL || ""}/images/Hero-Slide-2-BG.jpg)` }} />
            <div className="absolute inset-0 bg-slate-900/60 z-[1]" />

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center">
                    <span className="w-8 h-[1px] bg-red-600 mr-3" />GET IN TOUCH<span className="w-8 h-[1px] bg-red-600 ml-3" />
                </h6>
                <h2 className="text-4xl md:text-5xl font-black mb-12 leading-tight uppercase">Ready to Book Your Service?</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 max-w-5xl mx-auto">
                    {[
                        { icon: Clock, title: "Quick turnaround", desc: "We will get your car back on the road again" },
                        { icon: ShieldCheck, title: "Transparent Pricing", desc: "The Best Part? Zero Hidden Costs!" },
                        { icon: Wrench, title: "Expert Service", desc: "Trained Technicians and Genuine Equipment" },
                    ].map((item) => (
                        <div key={item.title} className="flex flex-col items-center">
                            <div className="text-white mb-4"><item.icon size={40} /></div>
                            <h5 className="font-black uppercase text-sm tracking-widest mb-2">{item.title}</h5>
                            <p className="text-slate-300 text-xs font-medium uppercase tracking-tight">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <Link href="/booking" className="inline-flex bg-white text-slate-900 hover:bg-slate-100 font-black py-5 px-12 rounded-lg text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 items-center">
                    <UserPlus size={18} className="mr-3" />BOOK NOW
                </Link>
            </div>
        </section>
    );
}
