"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Edit2, CheckCircle, XCircle, Info, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface EmailTemplate {
    id: number;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/email-templates");
            if (res.data.success) {
                setTemplates(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load email templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const toggleStatus = async (template: EmailTemplate) => {
        try {
            const res = await api.patch(`/admin/email-templates/${template.id}`, {
                is_active: !template.is_active,
                subject: template.subject, // API requires subject/body for validation
                body: template.body
            });
            if (res.data.success) {
                toast.success(`Template ${!template.is_active ? 'activated' : 'deactivated'}`);
                setTemplates(templates.map(t => t.id === template.id ? res.data.data : t));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">Email Templates</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage automated system emails and customization</p>
                    </div>
                    <button 
                        onClick={fetchTemplates}
                        className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 font-bold text-xs uppercase tracking-widest"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Refresh List</span>
                    </button>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Templates...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {templates.map((template) => (
                            <div key={template.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                                <div className="p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                                                <Mail size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-[#003366] uppercase tracking-tight">{template.name}</h3>
                                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] mt-0.5">Type: {template.type.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleStatus(template)}
                                            className={`p-1.5 rounded-lg transition-colors ${template.is_active ? 'text-green-500 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-50'}`}
                                            title={template.is_active ? "Active" : "Inactive"}
                                        >
                                            {template.is_active ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Default Subject</span>
                                            <p className="text-sm font-bold text-[#003366] line-clamp-1">{template.subject}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Available Variables</span>
                                            <div className="flex flex-wrap gap-2">
                                                {template.variables.map(v => (
                                                    <span key={v} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[9px] font-black text-[#003366] uppercase tracking-tight">[{v}]</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center space-x-3">
                                        <Link href={`/admin/email-templates/${template.id}`} className="flex-1 flex items-center justify-center space-x-2 bg-[#003366] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#002244] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#003366]/10">
                                            <Edit2 size={14} />
                                            <span>Customize Template</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-blue-50/50 rounded-[32px] border border-blue-100 p-8">
                    <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">Pro Tip: Using Variables</h4>
                            <p className="text-blue-700/80 text-xs leading-relaxed">
                                You can use the bracketed variables (e.g., [name]) anywhere in the subject or body. 
                                The system will automatically replace them with the actual data when sending the email. 
                                Make sure to keep the brackets exactly as shown.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
