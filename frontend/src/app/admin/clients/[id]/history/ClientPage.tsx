"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Loader2, User, Star, CreditCard, Car, Calendar, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
export default function ClientHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [client, setClient] = useState<any>(null);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const res = await api.get(`/admin/clients/${params.id}/history`);
                const d = res.data.data;
                // Merge the separate response keys into a flat client object
                setClient({
                    ...d.user,
                    bookings: d.bookings || [],
                    vehicles: d.vehicles || [],
                    payments: d.payments || [],
                });
            } catch (err: any) {
                console.error("Failed to load client history", err);
                toast({
                    variant: 'destructive',
                    title: "Not Found",
                    description: "Could not load the history for this client.",
                });
                router.push("/admin/clients");
            } finally {
                setLoading(false);
            }
        };
        fetchClientData();
    }, [params.id, router, toast]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[60vh] items-center justify-center flex-col">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
                    <p className="text-[10px] font-black text-[#003366] uppercase tracking-widest animate-pulse">Retrieving Profile...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!client) return null;

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <Link href="/admin/clients" className="inline-flex items-center text-red-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-[#003366] transition-colors">
                        <ArrowLeft size={14} className="mr-2" /> Back to Directory
                    </Link>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Client Profile</h2>
                    <p className="text-slate-500 font-medium italic">Complete history and engagement metrics</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Client Identity Card */}
                <div className="lg:col-span-1 space-y-10">
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-2xl -mr-10 -mt-10 z-0" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-3xl font-black text-[#003366]">
                                {client.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">{client.name}</h3>
                            <div className="flex items-center justify-center space-x-2 mb-6">
                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest">{client.membership_tier || 'Silver'} Member</span>
                            </div>

                            <div className="space-y-4 text-left border-t border-slate-100 pt-6">
                                <div className="flex items-center text-slate-500">
                                    <Mail size={16} className="mr-4 text-slate-400" />
                                    <span className="text-sm font-medium">{client.email}</span>
                                </div>
                                <div className="flex items-center text-slate-500">
                                    <Phone size={16} className="mr-4 text-slate-400" />
                                    <span className="text-sm font-medium">{client.phone || "Not Provided"}</span>
                                </div>
                                <div className="flex items-center text-slate-500">
                                    <Calendar size={16} className="mr-4 text-slate-400" />
                                    <span className="text-sm font-medium">Joined {new Date(client.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#003366] rounded-[40px] shadow-xl p-8 text-white">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 opacity-60">Value Metrics</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Lifetime Spent</p>
                                <p className="text-3xl font-black text-green-400">
                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(client.total_spent || 0))}
                                </p>
                            </div>
                            <div className="flex justify-between border-t border-white/10 pt-6">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Total Bookings</p>
                                    <p className="text-xl font-black">{client.bookings_count || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Loyalty Points</p>
                                    <p className="text-xl font-black">{client.loyalty_points || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Historical Data */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Vehicles */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black text-[#003366] uppercase tracking-[0.2em] flex items-center">
                                <Car size={16} className="mr-3 text-red-600" /> Registered Vehicles
                            </h3>
                            <span className="bg-slate-50 text-[#003366] px-3 py-1 rounded-full text-[10px] font-black">{client.vehicles?.length || 0}</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {client.vehicles?.length > 0 ? (
                                client.vehicles.map((vehicle: any) => (
                                    <div key={vehicle.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                <Car size={20} className="text-[#003366]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight mb-1">{vehicle.make} {vehicle.model}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vehicle.year} • {vehicle.registration}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400 font-medium text-sm">No vehicles registered.</div>
                            )}
                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-black text-[#003366] uppercase tracking-[0.2em] flex items-center">
                                <Calendar size={16} className="mr-3 text-red-600" /> Service History
                            </h3>
                            <span className="bg-slate-50 text-[#003366] px-3 py-1 rounded-full text-[10px] font-black">{client.bookings?.length || 0}</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {client.bookings?.length > 0 ? (
                                client.bookings.map((booking: any) => (
                                    <div key={booking.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                                                <span className="text-[9px] font-black text-red-600 uppercase">{new Date(booking.date || booking.preferred_date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="text-lg font-black leading-none">{new Date(booking.date || booking.preferred_date).getDate()}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-[#003366] uppercase tracking-tight mb-1">{booking.service}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                                                    <Car size={10} className="mr-2" /> {booking.registration || 'General Service'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${booking.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                booking.status === 'confirmed' ? 'bg-[#003366]/5 text-[#003366] border-[#003366]/10' :
                                                    booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400 font-medium text-sm">No bookings recorded.</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}
