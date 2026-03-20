import React from 'react';
import Layout from '../layouts/Layout';
import HeroCarousel from '../components/HeroCarousel';
import AboutSection from '../components/AboutSection';
import FactsSection from '../components/FactsSection';
import ServiceTabs from '../components/ServiceTabs';
import BrandsSection from '../components/BrandsSection';
import BookingCTA from '../components/BookingCTA';
import Testimonials from '../components/Testimonials';
import { ShieldCheck, Users, Wrench } from 'lucide-react';

const Home = () => {
    return (
        <Layout>
            <HeroCarousel />

            {/* Service Highlights - Overlapping Hero */}
            <div className="container mx-auto px-4 -mt-12 relative z-20 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-xl overflow-hidden shadow-none border border-slate-100">
                    <div className="bg-white p-10 border-r border-slate-100 flex flex-col items-center text-center group hover:bg-slate-50 transition-all duration-300">
                        <div className="text-red-600 mb-6 transform group-hover:scale-110 transition-transform">
                            <ShieldCheck size={56} strokeWidth={1.5} />
                        </div>
                        <h5 className="text-xl font-black mb-4 text-slate-900 uppercase tracking-tight">Transparent Pricing</h5>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Honest estimates and itemised invoices — no hidden charges. We believe in clear invoices with full transparency.</p>
                        <a href="/about" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-200 hover:text-red-600 hover:border-red-600 transition-all pb-1">Read More</a>
                    </div>

                    <div className="bg-[#f8f9fa] p-10 border-r border-slate-100 flex flex-col items-center text-center group transition-all duration-300">
                        <div className="text-red-600 mb-6 transform group-hover:scale-110 transition-transform">
                            <Users size={56} strokeWidth={1.5} />
                        </div>
                        <h5 className="text-xl font-black mb-4 text-slate-900 uppercase tracking-tight">Expert Technicians</h5>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Trained staff with access to specialists for complex jobs. Over 500 satisfied customers since opening.</p>
                        <a href="/services" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-200 hover:text-red-600 hover:border-red-600 transition-all pb-1">Read More</a>
                    </div>

                    <div className="bg-white p-10 flex flex-col items-center text-center group hover:bg-slate-50 transition-all duration-300">
                        <div className="text-red-600 mb-6 transform group-hover:scale-110 transition-transform">
                            <Wrench size={56} strokeWidth={1.5} />
                        </div>
                        <h5 className="text-xl font-black mb-4 text-slate-900 uppercase tracking-tight">Material Guarantee</h5>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">We use proper equipment and ECU diagnostics so problems get fixed right the first time every single time.</p>
                        <a href="/services" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-200 hover:text-red-600 hover:border-red-600 transition-all pb-1">Read More</a>
                    </div>
                </div>
            </div>

            <AboutSection />
            <FactsSection />
            <ServiceTabs />
            <BrandsSection />
            <BookingCTA />
            <Testimonials />
        </Layout>
    );
};

export default Home;
