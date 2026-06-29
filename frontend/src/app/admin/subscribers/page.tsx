"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Loader2, Mail, Trash2, CheckCircle, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MySwal from "@/lib/swal";

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => { fetchSubscribers(); }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/subscribers");
            setSubscribers(res.data.data || []);
            setStats(res.data.stats || { total: 0, active: 0, inactive: 0 });
        } catch (err) {
            console.error("Failed to fetch subscribers", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to load subscribers." });
        } finally { setLoading(false); }
    };

    const handleToggle = async (id: number) => {
        try {
            await api.patch(`/admin/subscribers/${id}/toggle`);
            fetchSubscribers();
            toast({ title: "Status Updated" });
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: "Delete Subscriber?",
            text: "This subscriber will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;

        try {
            await api.delete(`/admin/subscribers/${id}`);
            fetchSubscribers();
            toast({ title: "Deleted", description: "Subscriber removed." });
        } catch (err) {
            console.error("Failed to delete subscriber", err);
            toast({ variant: "destructive", title: "Error", description: "Delete failed." });
        }
    };

    const filtered = subscribers.filter((s) =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <PageHeader
                badge="Newsletter Management"
                title="Subscribers"
                description="Manage your newsletter subscriber list"
                action={
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-2xl font-black text-[#003366]">{stats.active}</p>
                            <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-2xl font-black text-[#003366]">{stats.total}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                    </div>
                }
            />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-[400px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                        placeholder="Search by email..."
                    />
                </div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Showing {filtered.length} Subscriber{filtered.length !== 1 && "s"}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading subscribers...</p>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No Subscribers Found"
                    description={searchTerm ? "No subscribers match your search" : "No newsletter subscribers yet"}
                />
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {filtered.map((subscriber) => (
                            <div
                                key={subscriber.id}
                                className="p-8 hover:bg-slate-50/50 transition-colors flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:border-red-600/20 transition-colors">
                                        <Mail size={18} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-[#003366]">
                                            {subscriber.email}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Subscribed {new Date(subscriber.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleToggle(subscriber.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${
                                            subscriber.is_active
                                                ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                                                : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        {subscriber.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                        {subscriber.is_active ? "Active" : "Inactive"}
                                    </button>
                                    <Button
                                        onClick={() => handleDelete(subscriber.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="w-9 h-9 bg-red-50 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
