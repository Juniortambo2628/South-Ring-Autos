import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Mail,
    MailOpen,
    Trash2,
    Search,
    User,
    Phone,
    Calendar,
    MessageCircle,
    Archive,
    CheckCircle2,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/contact');
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setActionLoading(id);
        try {
            const response = await axios.patch(`/api/contact/${id}/status`, { status });
            if (response.data.success) {
                setMessages(messages.map(m => m.id === id ? response.data.data : m));
                if (selectedMessage?.id === id) {
                    setSelectedMessage(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        setActionLoading(id);
        try {
            const response = await axios.delete(`/api/contact/${id}`);
            if (response.data.success) {
                setMessages(messages.filter(m => m.id !== id));
                if (selectedMessage?.id === id) setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesFilter = filter === 'all' || m.status === filter;
        const matchesSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.subject.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Inbound Messages</h1>
                    <p className="text-slate-500 font-medium italic">Manage customer inquiries and feedback.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
                {/* Messages List */}
                <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 space-y-4 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-medium"
                            />
                        </div>
                        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
                            {['all', 'unread', 'read'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`flex-1 py-1.5 px-3 rounded-md text-xs font-bold uppercase tracking-tight transition-all ${filter === f ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Synchronizing...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {filteredMessages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read');
                                        }}
                                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors relative group ${selectedMessage?.id === msg.id ? 'bg-red-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-bold ${msg.status === 'unread' ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {msg.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className={`text-xs font-bold mb-2 truncate ${msg.status === 'unread' ? 'text-red-700' : 'text-slate-500'}`}>
                                            {msg.subject}
                                        </div>
                                        <div className="text-xs text-slate-400 line-clamp-2 italic leading-relaxed">
                                            {msg.message}
                                        </div>
                                        {msg.status === 'unread' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-400 italic text-sm">
                                <MessageCircle size={32} className="mx-auto mb-2 opacity-20" />
                                No messages found
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Content */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div
                                key={selectedMessage.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col h-full"
                            >
                                {/* Message Header */}
                                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedMessage.subject}</h2>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <div className="flex items-center text-sm font-medium text-slate-600">
                                                <User size={14} className="mr-1.5 text-slate-400" /> {selectedMessage.name}
                                            </div>
                                            <div className="flex items-center text-sm font-medium text-slate-600">
                                                <Phone size={14} className="mr-1.5 text-slate-400" /> {selectedMessage.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center text-sm font-medium text-slate-600">
                                                <Mail size={14} className="mr-1.5 text-slate-400" /> {selectedMessage.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDelete(selectedMessage.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="Delete Message"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="flex-1 p-8 overflow-y-auto bg-white">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                                            {selectedMessage.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">Sent on</div>
                                            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest italic flex items-center">
                                                <Calendar size={12} className="mr-1" /> {new Date(selectedMessage.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="prose prose-slate max-w-none">
                                        <p className="text-slate-700 leading-relaxed font-medium text-lg italic bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-200">
                                            "{selectedMessage.message}"
                                        </p>
                                    </div>
                                </div>

                                {/* Message Footer Actions */}
                                <div className="p-4 border-t border-slate-100 bg-white flex justify-end items-center space-x-3">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                        className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95 flex items-center"
                                    >
                                        <MailOpen size={18} className="mr-2" /> Reply via Email
                                    </a>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                                        <Mail size={40} className="text-slate-200" />
                                    </div>
                                    <h3 className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Select a message to view content</h3>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminMessages;
