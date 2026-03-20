"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Clock, Car, ChevronRight, ChevronLeft,
    CheckCircle2, AlertCircle, Wrench, User, Loader2, MoreVertical
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import api from "@/lib/api";

const steps = [
    { id: 1, title: "Vehicle Info", icon: Car },
    { id: 2, title: "Service Date", icon: Calendar },
    { id: 3, title: "Confirmation", icon: CheckCircle2 }
];

const serviceTypes = [
    "General Service", "Engine Repair", "Diagnostics",
    "Accident Repair", "A/C Service", "Brake Repair", "Other"
];

function BookingForm() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        registration_number: searchParams.get("reg") || "",
        vehicle_make: searchParams.get("make") || "",
        vehicle_model: searchParams.get("model") || "",
        vehicle_year: searchParams.get("year") || "",
        vehicle_fuel_type: "",
        service_type: "Full Service",
        preferred_date: "",
        preferred_time: "morning",
        notes: "",
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setFormData(prev => ({
                    ...prev,
                    customer_name: user.name || prev.customer_name,
                    customer_email: user.email || prev.customer_email,
                    customer_phone: user.phone || prev.customer_phone,
                }));
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
            }
        }
    }, []);

    const brands = [
        "Toyota", "Nissan", "Honda", "Mazda", "Mitsubishi",
        "Subaru", "Mercedes-Benz", "BMW", "Audi", "Volkswagen",
        "Ford", "Hyundai", "Kia", "Lexus", "Land Rover"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1 && (!formData.registration_number || !formData.vehicle_make || !formData.vehicle_model)) {
            setError("Please fill in all vehicle details");
            return;
        }
        setError("");
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            // Map frontend field names to backend-expected field names
            const payload = {
                name: formData.customer_name,
                email: formData.customer_email,
                phone: formData.customer_phone,
                registration: formData.registration_number,
                vehicle_make: formData.vehicle_make,
                vehicle_model: formData.vehicle_model,
                vehicle_year: formData.vehicle_year,
                vehicle_fuel_type: formData.vehicle_fuel_type,
                service: formData.service_type,
                date: formData.preferred_date,
                preferred_time: formData.preferred_time,
                message: formData.notes,
            };
            const response = await api.post("/bookings", payload);
            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="Book Your Appointment"
                    subtitle="Schedule your car's next visit in less than 2 minutes. Choose your service, pick a date, and we'll handle the rest."
                    breadcrumb={[{ label: "BOOKING", href: "/booking" }]}
                />

                <section className="py-24 bg-slate-50 relative overflow-hidden">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {/* Stepper */}
                        <div className="flex justify-between items-center mb-16 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
                            {steps.map((s, i) => (
                                <div key={s.id} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${step >= s.id ? "bg-red-600 border-white text-white shadow-xl shadow-red-600/20" : "bg-white border-slate-200 text-slate-400"
                                        }`}>
                                        <s.icon size={20} />
                                    </div>
                                    <span className={`mt-3 text-[10px] font-black uppercase tracking-widest ${step >= s.id ? "text-red-600" : "text-slate-400"
                                        }`}>{s.title}</span>
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-12 rounded-3xl shadow-2xl text-center border border-slate-100"
                                >
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-[#003366] mb-4 uppercase tracking-tight">Booking Confirmed!</h2>
                                    <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">
                                        Thank you, {formData.customer_name}. We&apos;ve received your request for {formData.registration_number} on {formData.preferred_date}. Our team will call you shortly to confirm the exact time.
                                    </p>
                                    <Link href="/">
                                        <Button className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 h-auto rounded-xl uppercase tracking-widest text-xs">Return Home</Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100"
                                >
                                    {error && (
                                        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center">
                                            <AlertCircle size={20} className="mr-3" />
                                            <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Service</Label>
                                                    <select id="service_type" value={formData.service_type} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all appearance-none cursor-pointer">
                                                        {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Reg No.</Label>
                                                    <Input id="registration_number" placeholder="e.g. KBY 123X" value={formData.registration_number} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Brand</Label>
                                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                                    {brands.map(brand => (
                                                        <button
                                                            key={brand}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, vehicle_make: brand })}
                                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-2 group ${formData.vehicle_make === brand ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                        >
                                                            <div className="w-10 h-10 relative">
                                                                <img
                                                                    src={`/car-logos/${brand.toLowerCase().replace(/\s+/g, '-')}.png`}
                                                                    alt={brand}
                                                                    className={`w-full h-full object-contain transition-all ${formData.vehicle_make === brand ? 'grayscale-0 scale-110' : 'grayscale group-hover:grayscale-0'}`}
                                                                />
                                                            </div>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${formData.vehicle_make === brand ? 'text-red-600' : 'text-slate-400 group-hover:text-[#003366]'}`}>{brand}</span>
                                                        </button>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, vehicle_make: 'Other' })}
                                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-2 group ${formData.vehicle_make === 'Other' ? 'border-red-600 bg-red-50/50 shadow-lg shadow-red-600/10' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                                    >
                                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                                                            <MoreVertical size={16} className="text-slate-400" />
                                                        </div>
                                                        <span className={`text-[8px] font-black uppercase tracking-widest ${formData.vehicle_make === 'Other' ? 'text-red-600' : 'text-slate-400 group-hover:text-[#003366]'}`}>Other</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Model</Label>
                                                    <Input id="vehicle_model" placeholder="e.g. Vanguard" value={formData.vehicle_model} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year</Label>
                                                    <Input id="vehicle_year" type="number" placeholder="e.g. 2014" value={formData.vehicle_year} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Type</Label>
                                                    <select
                                                        id="vehicle_fuel_type"
                                                        value={formData.vehicle_fuel_type}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all appearance-none cursor-pointer h-[50px] mt-0"
                                                    >
                                                        <option value="">Select Fuel</option>
                                                        <option value="Petrol">Petrol</option>
                                                        <option value="Diesel">Diesel</option>
                                                        <option value="Electric">Electric</option>
                                                        <option value="Hybrid">Hybrid</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pt-6 flex justify-end">
                                                <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-6 h-auto rounded-xl uppercase tracking-widest text-xs flex items-center">
                                                    Next Step <ChevronRight size={16} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Date</Label>
                                                    <Input id="preferred_date" type="date" value={formData.preferred_date} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200 h-auto" />
                                                </div>
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Time Slot</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <button onClick={() => setFormData({ ...formData, preferred_time: "morning" })} className={`py-4 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.preferred_time === "morning" ? "bg-red-600 border-red-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                                            Morning
                                                        </button>
                                                        <button onClick={() => setFormData({ ...formData, preferred_time: "afternoon" })} className={`py-4 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.preferred_time === "afternoon" ? "bg-red-600 border-red-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                                                            Afternoon
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Notes</Label>
                                                <textarea id="notes" rows={4} value={formData.notes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all resize-none" placeholder="Describe any issues or specific requests..."></textarea>
                                            </div>
                                            <div className="pt-6 flex justify-between">
                                                <Button onClick={prevStep} variant="ghost" className="text-slate-500 font-black px-10 py-6 h-auto rounded-xl uppercase tracking-widest text-xs flex items-center">
                                                    <ChevronLeft size={16} className="mr-2" /> Back
                                                </Button>
                                                <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-6 h-auto rounded-xl uppercase tracking-widest text-xs flex items-center">
                                                    Next Step <ChevronRight size={16} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-8">
                                            <div className="bg-slate-50/80 p-6 rounded-2xl border border-dashed border-slate-200 mb-8">
                                                <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Summary</h4>
                                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 uppercase tracking-tight">
                                                    <div>VEHICLE: <span className="text-[#003366]">{formData.vehicle_make} {formData.vehicle_model} {formData.vehicle_year} ({formData.vehicle_fuel_type})</span></div>
                                                    <div>REG: <span className="text-[#003366]">{formData.registration_number}</span></div>
                                                    <div>SERVICE: <span className="text-[#003366]">{formData.service_type}</span></div>
                                                    <div>DATE: <span className="text-[#003366]">{formData.preferred_date}</span></div>
                                                    <div>TIME: <span className="text-[#003366]">{formData.preferred_time}</span></div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</Label>
                                                    <Input id="customer_name" placeholder="John Doe" value={formData.customer_name} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</Label>
                                                        <Input id="customer_email" type="email" placeholder="john@example.com" value={formData.customer_email} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</Label>
                                                        <Input id="customer_phone" placeholder="+254 700 000 000" value={formData.customer_phone} onChange={handleChange} className="py-6 rounded-xl bg-slate-50/50 border-slate-200" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 flex justify-between">
                                                <Button onClick={prevStep} variant="ghost" className="text-slate-500 font-black px-10 py-6 h-auto rounded-xl uppercase tracking-widest text-xs flex items-center">
                                                    <ChevronLeft size={16} className="mr-2" /> Back
                                                </Button>
                                                <Button onClick={handleSubmit} disabled={loading} className="bg-[#003366] hover:bg-blue-900 text-white font-black px-10 py-6 h-auto rounded-xl uppercase tracking-widest text-xs flex items-center shadow-xl shadow-blue-900/10">
                                                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />} Confirm Booking
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        }>
            <BookingForm />
        </Suspense>
    );
}
