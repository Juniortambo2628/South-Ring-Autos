"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface AddVehicleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AddVehicleModal({ open, onOpenChange, onSuccess }: AddVehicleModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        year: "",
        registration: "",
        color: "",
        fuel_type: "",
        mileage: "",
    });

    const brands = [
        "Toyota", "Nissan", "Honda", "Mazda", "Mitsubishi",
        "Subaru", "Mercedes-Benz", "BMW", "Audi", "Volkswagen",
        "Ford", "Hyundai", "Kia", "Lexus", "Land Rover"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/vehicles", {
                ...formData,
                year: formData.year ? parseInt(formData.year) : null,
                mileage: formData.mileage ? parseInt(formData.mileage) : null,
            });

            if (res.data.success) {
                onOpenChange(false);
                setFormData({
                    make: "",
                    model: "",
                    year: "",
                    registration: "",
                    color: "",
                    mileage: "",
                });
                onSuccess();
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register vehicle. Please check if the registration is unique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[40px] p-0 overflow-hidden">
                <div className="bg-[#003366] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <DialogHeader className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20 backdrop-blur-md">
                            <Car size={24} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Register Vehicle</DialogTitle>
                        <DialogDescription className="text-white/60 font-medium italic">
                            Add a new vehicle to your garage for easier bookings.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start space-x-3">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <p className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="make" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Make / Brand</Label>
                            <select
                                id="make"
                                value={formData.make}
                                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all outline-none appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Select Brand</option>
                                {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</Label>
                            <Input
                                id="model"
                                placeholder="e.g. Vanguard"
                                value={formData.model}
                                onChange={handleChange}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-5 font-bold focus:bg-white transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="registration" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reg. Number</Label>
                            <Input
                                id="registration"
                                placeholder="e.g. KBY 123X"
                                value={formData.registration}
                                onChange={handleChange}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-5 font-bold focus:bg-white transition-all outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</Label>
                            <Input
                                id="year"
                                type="number"
                                placeholder="e.g. 2018"
                                value={formData.year}
                                onChange={handleChange}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-5 font-bold focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="color" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color</Label>
                            <Input
                                id="color"
                                placeholder="e.g. Silver"
                                value={formData.color}
                                onChange={handleChange}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-5 font-bold focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fuel_type" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fuel Type</Label>
                            <select
                                id="fuel_type"
                                value={formData.fuel_type}
                                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Fuel</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="mileage" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mileage (KM)</Label>
                            <Input
                                id="mileage"
                                type="number"
                                placeholder="e.g. 45000"
                                value={formData.mileage}
                                onChange={handleChange}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-5 font-bold focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003366] hover:bg-red-600 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-900/10"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                            {loading ? "Registering..." : "Add Vehicle to Garage"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
