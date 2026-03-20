"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ArrowLeft, Save, Mail, Info, Loader2, BookOpen } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EmailTemplate {
    id: number;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
    is_active: boolean;
}

export default function EditEmailTemplatePage() {
    const { id } = useParams();
    const router = useRouter();
    const [template, setTemplate] = useState<EmailTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await api.get(`/admin/email-templates/${id}`);
                if (res.data.success) {
                    setTemplate(res.data.data);
                }
            } catch (error) {
                toast.error("Failed to load template");
                router.push("/admin/email-templates");
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, [id, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!template) return;

        setSaving(true);
        try {
            const res = await api.patch(`/admin/email-templates/${id}`, {
                subject: template.subject,
                body: template.body,
                is_active: template.is_active
            });
            if (res.data.success) {
                toast.success("Template saved successfully");
                router.push("/admin/email-templates");
            }
        } catch (error) {
            toast.error("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-[400px] flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Template Editor...</p>
                </div>
            </AdminLayout>
        );
    }

    if (!template) return null;

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <Link href="/admin/email-templates" className="inline-flex items-center space-x-2 text-slate-400 hover:text-[#003366] transition-colors group">
                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-[#003366]/20 group-hover:bg-slate-50">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Templates</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${template.is_active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                            {template.is_active ? 'Status: Active' : 'Status: Inactive'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center space-x-4">
                                <div className="w-14 h-14 bg-[#003366] rounded-2xl flex items-center justify-center text-white">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-[#003366] uppercase tracking-tight">{template.name}</h1>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Flow ID: {template.type}</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-8 space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest block ml-4">Email Subject Line</label>
                                    <input 
                                        type="text" 
                                        value={template.subject}
                                        onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                                        className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-[#003366]/10 text-sm font-bold text-[#003366] transition-all"
                                        placeholder="Enter email subject..."
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[#003366] uppercase tracking-widest block ml-4">Email Body Message</label>
                                    <textarea 
                                        value={template.body}
                                        onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                                        className="w-full min-h-[400px] p-8 rounded-[32px] bg-slate-50 border-none focus:ring-2 focus:ring-[#003366]/10 text-sm font-medium text-slate-600 leading-relaxed transition-all resize-none"
                                        placeholder="Write your email content here (supports plain text and placeholder tags)..."
                                        required
                                    />
                                </div>

                                <button 
                                    disabled={saving}
                                    className="w-full bg-[#003366] text-white h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 hover:bg-[#002244] transition-all transform hover:-translate-y-0.5 shadow-xl shadow-[#003366]/20 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    <span>{saving ? "Updating Template..." : "Save Template Changes"}</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Reference & Help */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="text-xs font-black text-[#003366] uppercase tracking-widest">Available Variables</h3>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 mb-6 leading-relaxed font-medium">
                                You can use these tags anywhere in the subject or body. They will be replaced by user data when sending.
                            </p>

                            <div className="space-y-3">
                                {template.variables.map(v => (
                                    <div key={v} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
                                        <code className="text-xs font-black text-red-600">[{v}]</code>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`[${v}]`);
                                                toast.success(`Copied [${v}]`);
                                            }}
                                            className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#003366] opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#003366] rounded-[32px] p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Info size={18} className="text-red-400" />
                                    <h3 className="text-xs font-black uppercase tracking-widest">Writing Guide</h3>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                        <p className="text-[11px] font-medium leading-relaxed opacity-80">Use line breaks to separate paragraphs. The system will preserve them.</p>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                        <p className="text-[11px] font-medium leading-relaxed opacity-80">Variables like <span className="text-red-400 font-bold">[name]</span> help personalize communication.</p>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                                        <p className="text-[11px] font-medium leading-relaxed opacity-80">Templates are wrapped in a professional South Ring Autos brand frame.</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
