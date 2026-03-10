import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Settings, AlertTriangle, Activity, Database, Truck, ChevronRight, ArrowRight } from 'lucide-react';

const services = [
    {
        id: 'general',
        label: 'General Service',
        icon: <Wrench size={20} />,
        title: 'General Service (MPESA-friendly quick checks)',
        description: 'Quality Engine Service with genuine parts for your Honda, Toyota, Nissan, Mazda, etc. Stop guessing and get your car scanned by professionals.',
        points: ['Oil & Filter Change', 'Full Fluid Check', 'Brake Inspection', 'Engine Diagnostic'],
        image: '/images/Car-Assessment-2.jpg'
    },
    {
        id: 'engine',
        label: 'Engine & Transmission',
        icon: <Settings size={20} />,
        title: 'Engine & Transmission Specialist',
        description: 'Complete engine servicing including overhaul, transmission repair, and high-precision tuning for performance and reliability.',
        points: ['Engine Overhaul', 'Gearbox Repair', 'Clutch Replacement', 'Performance Tuning'],
        image: '/images/Engine-repairs.jpg'
    },
    {
        id: 'accident',
        label: 'Accident Repair',
        icon: <AlertTriangle size={20} />,
        title: 'Accident Repair & Bodywork',
        description: 'Professional panel beating, spray painting, and structural repairs. We restore your vehicle to its pre-accident condition.',
        points: ['Panel Beating', 'Spray Painting', 'Chassis Alignment', 'Buffing & Waxing'],
        image: '/images/Car-Lift-Raised.jpg'
    },
    {
        id: 'diagnostics',
        label: 'Diagnostics',
        icon: <Activity size={20} />,
        title: 'Computerised Diagnostics',
        description: 'Advanced ECU diagnostics and electrical troubleshooting. Identifying sensory and mechanical faults with 99% accuracy.',
        points: ['Scanner Diagnostics', 'Wiring Repairs', 'Sensor Testing', 'ABS/Airbag Light Reset'],
        image: '/images/Car-Assessment-2.jpg'
    },
    {
        id: 'specialized',
        label: 'Specialized Services',
        icon: <Truck size={20} />,
        title: 'Specialized Fleet & Hybrid Service',
        description: 'Customized maintenance programs for corporate fleets and specialized care for hybrid and luxury vehicles.',
        points: ['Fleet Maintenance', 'Hybrid Battery Check', 'Suspension Overhaul', 'AC Refilling'],
        image: '/images/Engine-block-3.jpg'
    }
];

const ServiceTabs = () => {
    const [activeTab, setActiveTab] = useState(services[0].id);

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center">
                        <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
                        A CARING TRADITION
                        <span className="w-8 h-[1px] bg-red-600 ml-3"></span>
                    </h6>
                    <h2 className="text-4xl md:text-5xl font-black text-[#003366] leading-tight uppercase tracking-tighter">
                        Explore Our Services
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-0 shadow-2xl rounded-2xl overflow-hidden bg-white border border-slate-100">
                    {/* Tabs Navigation */}
                    <div className="lg:w-1/3 bg-slate-50 border-r border-slate-100">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => setActiveTab(service.id)}
                                className={`w-full text-left px-8 py-5 border-b border-slate-100 flex items-center transition-all relative ${activeTab === service.id
                                    ? 'bg-red-600 text-white shadow-lg z-10'
                                    : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                <span className={`mr-4 ${activeTab === service.id ? 'text-white' : 'text-red-600'}`}>
                                    {service.icon}
                                </span>
                                <span className="font-black text-xs uppercase tracking-widest">{service.label}</span>
                                {activeTab === service.id && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-red-600 rotate-45 hidden lg:block"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-2/3 p-4 md:p-12">
                        <AnimatePresence mode="wait">
                            {services.map((service) => (
                                activeTab === service.id && (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col md:flex-row gap-10 min-h-[400px]"
                                    >
                                        <div className="md:w-1/2 rounded-xl overflow-hidden shadow-lg border-4 border-slate-50">
                                            <img
                                                src={service.image}
                                                alt={service.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="md:w-1/2 flex flex-col justify-center">
                                            <h3 className="text-2xl font-black text-slate-900 mb-4">{service.title}</h3>
                                            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{service.description}</p>

                                            <div className="grid grid-cols-1 gap-3 mb-10">
                                                {service.points.map((point, idx) => (
                                                    <div key={idx} className="flex items-center text-slate-700">
                                                        <ChevronRight size={14} className="text-red-600 mr-2" />
                                                        <span className="text-xs font-bold uppercase tracking-wide">{point}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <a
                                                href="/services"
                                                className="inline-flex bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded text-[10px] uppercase tracking-widest w-max transition-all shadow-xl shadow-red-600/20"
                                            >
                                                VIEW ALL SERVICES <ArrowRight size={14} className="ml-2" />
                                            </a>
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServiceTabs;
