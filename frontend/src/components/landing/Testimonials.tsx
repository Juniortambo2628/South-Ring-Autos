import { Quote } from "lucide-react";

const testimonials = [
    { id: 1, name: "Kevin N.", role: "Honda Fit", image: "https://randomuser.me/api/portraits/men/32.jpg", content: "Excellent service! The team was professional and the engine scan was very detailed. Highly recommend South Ring Autos." },
    { id: 2, name: "Sarah M.", role: "Toyota VitZ", image: "https://randomuser.me/api/portraits/women/44.jpg", content: "Transparent costing and great turnaround time. Finally found a mechanic I can trust in Karen." },
    { id: 3, name: "James K.", role: "VW Golf", image: "https://randomuser.me/api/portraits/men/86.jpg", content: "They fixed my transmission issues when others couldn't. Expert technicians who know what they're doing." },
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center">
                        <span className="w-8 h-[1px] bg-red-600 mr-3" />TESTIMONIALS<span className="w-8 h-[1px] bg-red-600 ml-3" />
                    </h6>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase">
                        What Our Clients <span className="text-red-600">Say!</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((t) => (
                        <div key={t.id} className="p-10 bg-slate-50 border-b-4 border-red-600 hover:bg-white hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white mb-6 border-4 border-white shadow-md overflow-hidden">
                                <img src={t.image} alt={t.name} className="w-full h-full object-cover grayscale opacity-80" />
                            </div>
                            <h4 className="font-black text-slate-900 uppercase text-sm tracking-widest mb-1">{t.name}</h4>
                            <span className="text-red-600 font-bold text-[10px] uppercase tracking-wide mb-6">{t.role}</span>
                            <div className="relative">
                                <Quote className="absolute -top-4 -left-4 text-slate-200" size={32} />
                                <p className="text-slate-500 text-sm italic leading-relaxed font-medium relative z-[1]">&quot;{t.content}&quot;</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
