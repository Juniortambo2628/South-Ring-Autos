"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import {
    Car, Plus, Settings,
    MoreVertical, Trash2,
    Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import AddVehicleModal from "@/components/dashboard/AddVehicleModal";
import VehicleGallery from "@/components/dashboard/VehicleGallery";
import { useRouter } from "next/navigation";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedGalleryVehicle, setSelectedGalleryVehicle] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await api.get("/vehicles");
            if (res.data.success) {
                setVehicles(res.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
        } finally {
            setLoading(false);
        }
    };

    const getBrandLogo = (make: string) => {
        if (!make) return undefined;
        const brand = make.toLowerCase().trim().replace(/\s+/g, '-');
        return `/car-logos/${brand}.png`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">My Garage</h2>
                    <p className="text-slate-500 font-medium italic">Manage your registered vehicles and maintenance logs</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/10 transition-all flex items-center space-x-3"
                >
                    <Plus size={18} />
                    <span>Add New Vehicle</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {vehicles.length > 0 ? (
                    vehicles.map((vehicle, idx) => (
                        <motion.div
                            key={vehicle.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 relative group overflow-hidden hover:shadow-2xl hover:shadow-slate-200/5 transition-all"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button className="text-slate-300 hover:text-red-600 transition-colors">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="flex items-start space-x-8">
                                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-all overflow-hidden p-4 relative">
                                    <img
                                        src={getBrandLogo(vehicle.make)}
                                        alt={vehicle.make}
                                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "";
                                            (e.target as HTMLImageElement).className = "hidden";
                                            const parent = (e.target as HTMLElement).parentElement;
                                            if (parent) {
                                                const icon = document.createElement("div");
                                                icon.className = "text-[#003366] opacity-20";
                                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
                                                parent.appendChild(icon);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-2xl font-black text-[#003366] tracking-tighter uppercase">{vehicle.make} {vehicle.model}</h3>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">
                                            {vehicle.status || "Active"}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mb-8">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            {vehicle.registration}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {vehicle.year} • {vehicle.color || "N/A"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fuel Type</p>
                                            <p className="text-[11px] font-black text-[#003366] uppercase whitespace-nowrap">{vehicle.fuel_type || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Mileage</p>
                                            <p className="text-[11px] font-black text-[#003366] uppercase whitespace-nowrap">{vehicle.mileage ? `${vehicle.mileage} KM` : "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 mt-8">
                                        <Button
                                            onClick={() => router.push(`/booking?reg=${encodeURIComponent(vehicle.registration)}&make=${encodeURIComponent(vehicle.make)}&model=${encodeURIComponent(vehicle.model)}&year=${encodeURIComponent(vehicle.year || '')}&fuel=${encodeURIComponent(vehicle.fuel_type || '')}`)}
                                            className="flex-grow bg-[#003366] hover:bg-red-600 text-white rounded-2xl h-12 text-[9px] font-black uppercase tracking-[0.2em] shadow-none transition-all"
                                        >
                                            Book Service
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedGalleryVehicle(vehicle.id)}
                                            className="bg-white hover:bg-slate-50 text-[#003366] border border-slate-200 rounded-2xl h-12 px-6 shadow-none transition-all flex items-center space-x-2"
                                            title="View Gallery"
                                        >
                                            <ImageIcon size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <motion.button
                        onClick={() => setIsAddModalOpen(true)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-50/30 rounded-[40px] p-10 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:bg-white hover:border-red-600/30 transition-all cursor-pointer min-h-[300px]"
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Plus size={32} className="text-slate-300 group-hover:text-red-600 transition-colors" />
                        </div>
                        <h4 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">Register Your Vehicle</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">Add your first car to start tracking your clinic appointments.</p>
                    </motion.button>
                )}
            </div>

            <AddVehicleModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onSuccess={fetchVehicles}
            />

            {selectedGalleryVehicle && (
                <VehicleGallery
                    vehicleId={selectedGalleryVehicle}
                    onClose={() => setSelectedGalleryVehicle(null)}
                />
            )}
        </DashboardLayout>
    );
}
