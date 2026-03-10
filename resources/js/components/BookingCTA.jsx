import React from 'react';
import { CalendarCheck, Phone, Clock, ShieldCheck, Wrench, UserPlus } from 'lucide-react';

const BookingCTA = () => {
    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('/images/Hero-Slide-2-BG.jpg')] bg-cover bg-fixed bg-center"></div>
            <div className="absolute inset-0 bg-slate-900/60 z-1"></div>

            <div className="container mx-auto px-4 relative z-10 text-center text-white">
                <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center">
                    <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
                    GET IN TOUCH
                    <span className="w-8 h-[1px] bg-red-600 ml-3"></span>
                </h6>
                <h2 className="text-4xl md:text-5xl font-black mb-12 leading-tight uppercase">
                    Ready to Book Your Service?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="text-white mb-4"><Clock size={40} /></div>
                        <h5 className="font-black uppercase text-sm tracking-widest mb-2">Quick turnaround</h5>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-tight">We will get your car back on the road again</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-white mb-4"><ShieldCheck size={40} /></div>
                        <h5 className="font-black uppercase text-sm tracking-widest mb-2">Transparent Pricing</h5>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-tight">The Best Part? Zero Hidden Costs!</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="text-white mb-4"><Wrench size={40} /></div>
                        <h5 className="font-black uppercase text-sm tracking-widest mb-2">Expert Service</h5>
                        <p className="text-slate-300 text-xs font-medium uppercase tracking-tight">Trained Technicians and Genuine Equipment</p>
                    </div>
                </div>

                <a
                    href="/booking"
                    className="inline-flex bg-white text-slate-900 hover:bg-slate-100 font-black py-5 px-12 rounded-lg text-xs uppercase tracking-[0.2em] shadow-2xl transition-all transform hover:-translate-y-1 items-center"
                >
                    <UserPlus size={18} className="mr-3" />
                    BOOK NOW
                </a>
            </div>
        </section>
    );
};

export default BookingCTA;
