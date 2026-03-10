"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Search, Mail, MessageSquare, Trash2,
    CheckCircle, Clock, User, ChevronRight,
    Loader2, AlertCircle, Grid, List as ListIcon,
    CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { ContactMessage } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [isDeleting, setIsDeleting] = useState<Record<number, boolean>>({});
    const { toast } = useToast();

    // New Features
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await api.get("/contact");
            setMessages(response.data.data || []);
        } catch (err: any) {
            console.error("Failed to fetch messages", err);
            toast({
                variant: 'destructive',
                title: 'Loading Failed',
                description: err.response?.data?.message || 'Could not load the secure mailbox.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const result = await MySwal.fire({
            title: 'Delete Message?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setIsDeleting(prev => ({ ...prev, [id]: true }));
        try {
            await api.delete(`/contact/${id}`);
            toast({
                title: 'Message Deleted',
                description: 'The correspondence has been securely removed.',
            });
            fetchMessages();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
        } catch (err: any) {
            console.error("Failed to delete message", err);
            toast({
                variant: 'destructive',
                title: 'Deletion Error',
                description: err.response?.data?.message || 'The system could not delete this message.',
            });
        } finally {
            setIsDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Messages?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/contact/${id}`)));
            setSelectedIds([]);
            fetchMessages();
            toast({ title: "Messages Deleted", description: "Selected correspondence has been securely removed." });
        } catch (err) {
            console.error("Failed to delete messages", err);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete some messages." });
        }
    };

    const toggleSelection = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredMessages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMessages.map(m => m.id));
        }
    };

    let filteredMessages = messages.filter(m => {
        const matchesSearch =
            (m.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (m.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (m.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        const matchesFilter = filter === "all" || (filter === "unread" ? m.status === 'unread' : m.status !== 'unread');
        return matchesSearch && matchesFilter;
    });

    filteredMessages = filteredMessages.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOrder === 'a-z') return (a.name || "").localeCompare(b.name || "");
        return 0;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Communication Center</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Inbound Messages</h2>
                    <p className="text-slate-500 font-medium italic">Manage customer inquiries and feedback from the contact portal</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                {/* Left Sidebar - Filters */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 pl-2">Folders</p>
                        <nav className="space-y-2">
                            {[
                                { id: "all", label: "All Messages", icon: MessageSquare, color: "text-blue-600", count: messages.length },
                                { id: "unread", label: "Unread", icon: Mail, color: "text-red-600", count: messages.filter(m => m.status === 'unread').length },
                                { id: "read", label: "Read", icon: CheckCircle, color: "text-green-600", count: messages.filter(m => m.status !== 'unread').length },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilter(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${filter === item.id
                                        ? "bg-slate-50 text-[#003366] border border-slate-100 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50/50 border border-transparent"
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon size={16} className={filter === item.id ? item.color : "text-slate-400"} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${filter === item.id ? 'bg-white text-[#003366] shadow-sm' : 'bg-slate-100 text-slate-400'}`}>{item.count}</span>
                                        {filter === item.id && <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />}
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-gradient-to-br from-[#003366] to-blue-900 rounded-[32px] p-6 text-white shadow-xl shadow-blue-900/10 hidden lg:block">
                        <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                            <AlertCircle size={20} className="text-red-400" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-tight mb-2">Notice</h4>
                        <p className="text-[10px] text-blue-100 font-medium leading-relaxed italic opacity-80">
                            "Quick responses to inquiries improve customer conversion by up to 40%."
                        </p>
                    </div>
                </div>

                {/* Right Content - Message List */}
                <div className="lg:col-span-9 space-y-4">
                    {/* Controls Bar */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-[280px] group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                                <Input
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                    placeholder="Search sender or subject..."
                                />
                            </div>
                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value as any)}
                                className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="a-z">Sender (A-Z)</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                                {selectedIds.length === filteredMessages.length && filteredMessages.length > 0 ? <CheckSquare size={14} className="text-red-600" /> : <Square size={14} />} Select All
                            </button>
                            <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                                    <ListIcon size={14} />
                                </button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                                    <Grid size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions Menu */}
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-[#003366] text-white rounded-2xl p-4 flex items-center justify-between shadow-xl shadow-[#003366]/10 mb-2">
                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest pl-4">
                                        <span className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">{selectedIds.length}</span>
                                        Messages Selected
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSelectedIds([])} className="px-6 h-10 rounded-xl hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                        <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 h-10 px-6 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Trash2 size={14} /> Delete Selected
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
                            <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-6" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing secure mailbox...</p>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-sm min-h-[500px]">
                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 border border-slate-100 mb-6">
                                <MessageSquare size={40} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiet inbox. No results found.</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col pt-2">
                            <div className="divide-y divide-slate-50 flex-1">
                                {filteredMessages.map(msg => (
                                    <div key={msg.id} className={`p-6 hover:bg-slate-50/50 transition-all group cursor-pointer relative flex items-start ${selectedIds.includes(msg.id) ? 'bg-red-50/20' : ''}`}>
                                        {msg.status === 'unread' && <div className="absolute left-0 top-6 bottom-6 w-1 bg-red-600 opacity-50 rounded-r-full" />}

                                        <div className="mr-6 pt-4 text-slate-400" onClick={(e) => toggleSelection(msg.id, e)}>
                                            {selectedIds.includes(msg.id) ? <CheckSquare className="text-red-600" size={18} /> : <Square size={18} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
                                        </div>

                                        <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between min-w-0 pr-4">
                                            <div className="flex items-start space-x-6 min-w-0 flex-1">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all mt-1 ${msg.status === 'unread'
                                                    ? "bg-[#003366] text-white border-[#003366] shadow-md shadow-[#003366]/20"
                                                    : "bg-slate-50 text-slate-400 border-slate-100"
                                                    }`}>
                                                    <span className="text-[10px] font-black">{msg.name?.charAt(0)}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center space-x-3 mb-1.5 flex-wrap">
                                                        <span className="font-black text-sm uppercase tracking-tight text-[#003366] truncate">{msg.name}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{msg.email}</span>
                                                        {msg.phone && (
                                                            <>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{msg.phone}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h4 className={`text-[12px] font-black uppercase tracking-tight mb-2 truncate ${msg.status === 'unread' ? "text-red-600" : "text-slate-600"}`}>
                                                        {msg.subject || "No Subject Provided"}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-500 font-medium italic line-clamp-2 leading-relaxed">
                                                        {msg.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start mt-4 md:mt-0 pl-18 md:pl-4">
                                                <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                                                    <Clock size={10} className="mr-2" /> {new Date(msg.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button className="w-9 h-9 bg-white text-[#003366] border border-slate-100 rounded-xl flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all shadow-sm">
                                                        <ChevronRight size={16} />
                                                    </button>
                                                    <button disabled={isDeleting[msg.id]} onClick={(e) => handleDelete(msg.id, e)} className="w-9 h-9 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm">
                                                        {isDeleting[msg.id] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Showing {filteredMessages.length} Messages</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMessages.map(msg => (
                                <div key={msg.id} className={`bg-white rounded-[32px] border transition-all duration-300 relative group p-6 flex flex-col ${selectedIds.includes(msg.id) ? 'border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                                    {/* Card Selection */}
                                    <div className="absolute top-6 left-6 z-10 text-slate-400" onClick={(e) => toggleSelection(msg.id, e)}>
                                        {selectedIds.includes(msg.id) ? <CheckSquare className="text-red-600" size={18} /> : <Square size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>

                                    <div className="flex justify-between items-start mb-4 pl-8">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-black text-[10px] ${msg.status === 'unread'
                                            ? "bg-[#003366] text-white border-[#003366] shadow-sm"
                                            : "bg-slate-50 text-slate-400 border-slate-100"
                                            }`}>
                                            {msg.name?.charAt(0)}
                                        </div>
                                        <div className="flex items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                            <Clock size={8} className="mr-1" /> {new Date(msg.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-sm font-black uppercase tracking-tight text-[#003366] mb-1 truncate">{msg.name}</h3>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 truncate">{msg.email}</p>

                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4 flex-1">
                                            <h4 className={`text-[11px] font-black uppercase tracking-tight mb-2 truncate ${msg.status === 'unread' ? "text-red-600" : "text-slate-600"}`}>
                                                {msg.subject || "No Subject Provided"}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 font-medium italic line-clamp-3 leading-relaxed">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <button className="flex-1 h-9 bg-white text-[#003366] border border-slate-100 rounded-xl flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all shadow-sm text-[9px] font-black uppercase tracking-widest">
                                            <Mail size={12} className="mr-2" /> Read
                                        </button>
                                        <button disabled={isDeleting[msg.id]} onClick={(e) => handleDelete(msg.id, e)} className="w-9 h-9 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm shrink-0">
                                            {isDeleting[msg.id] ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                        </button>
                                    </div>

                                    {msg.status === 'unread' && <div className="absolute top-4 right-4 w-2 h-2 bg-red-600 rounded-full shadow-sm shadow-red-600/50" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
