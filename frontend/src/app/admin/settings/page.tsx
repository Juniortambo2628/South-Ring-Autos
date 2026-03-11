"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Settings, Save, Shield, Database,
    Globe, Palette, Bell, Eye, EyeOff,
    CheckCircle2, AlertCircle, Loader2, GripVertical, CheckSquare, Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const MySwal = withReactContent(Swal);

// Default sections if none exist in DB
const DEFAULT_SECTIONS = [
    { id: 'hero', label: 'Hero Section', visible: true },
    { id: 'services', label: 'Our Services', visible: true },
    { id: 'appraisal', label: 'Vehicle Appraisal', visible: true },
    { id: 'featured_journals', label: 'Featured Journals', visible: true },
    { id: 'latest_blogs', label: 'Latest News & Blogs', visible: true },
    { id: 'testimonials', label: 'Testimonials', visible: true },
    { id: 'contact', label: 'Contact Us', visible: true }
];

// Default nav links
const DEFAULT_NAV_LINKS = [
    { id: 'home', label: 'Home', href: '/', visible: true },
    { id: 'services', label: 'Services', href: '/services', visible: true },
    { id: 'journals', label: 'Journals', href: '/journals', visible: true },
    { id: 'blog', label: 'Blog', href: '/blog', visible: true },
    { id: 'contact', label: 'Contact', href: '/contact', visible: true }
];

export default function AdminSettingsPage() {
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // Form Data
    const [formData, setFormData] = useState({
        site_name: "South Ring Autos",
        support_email: "support@southringautos.ie",
        contact_phone: "+353 21 496 5388",
        office_address: "Kinsale Rd, Ballinlough, Cork, T12 CP22",
        primary_color: "#003366",
        accent_color: "#ef4444",
    });

    // Draggable Configs
    const [landingSections, setLandingSections] = useState(DEFAULT_SECTIONS);
    const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/settings');
            const data = res.data.settings;
            if (data) {
                setFormData({
                    site_name: data.company_name || "South Ring Autos",
                    support_email: data.company_email || "support@southringautos.ie",
                    contact_phone: data.company_phone || "+353 21 496 5388",
                    office_address: data.company_address || "Kinsale Rd, Ballinlough, Cork, T12 CP22",
                    primary_color: data.primary_color || "#003366",
                    accent_color: data.accent_color || "#ef4444",
                });

                if (data.landing_page_sections) {
                    try {
                        const parsed = typeof data.landing_page_sections === 'string' ? JSON.parse(data.landing_page_sections) : data.landing_page_sections;
                        if (parsed && Array.isArray(parsed) && parsed.length > 0) setLandingSections(parsed);
                    } catch (e) { }
                }

                if (data.nav_links) {
                    try {
                        const parsed = typeof data.nav_links === 'string' ? JSON.parse(data.nav_links) : data.nav_links;
                        if (parsed && Array.isArray(parsed) && parsed.length > 0) setNavLinks(parsed);
                    } catch (e) { }
                }
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        try {
            const settingsPayload = {
                company_name: formData.site_name,
                company_email: formData.support_email,
                company_phone: formData.contact_phone,
                company_address: formData.office_address,
                primary_color: formData.primary_color,
                accent_color: formData.accent_color,
                landing_page_sections: landingSections,
                nav_links: navLinks
            };

            await api.post("/settings", { settings: settingsPayload });
            MySwal.fire('Saved!', 'Settings have been updated successfully.', 'success');
        } catch (err) {
            console.error("Failed to update settings", err);
            MySwal.fire('Error', 'Failed to save settings.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Drag and Drop Handlers
    const onDragEndSections = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(landingSections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setLandingSections(items);
    };

    const toggleSectionVisibility = (id: string) => {
        setLandingSections(landingSections.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
    };

    const onDragEndNavs = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(navLinks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setNavLinks(items);
    };

    const toggleNavVisibility = (id: string) => {
        setNavLinks(navLinks.map(n => n.id === id ? { ...n, visible: !n.visible } : n));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 size={40} className="animate-spin text-red-600 mb-4" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Settings...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">System Configuration</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Portal Settings</h2>
                    <p className="text-slate-500 font-medium italic">Configure global parameters, site structure, and UI layout</p>
                </div>

                <Button onClick={handleSave} disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center space-x-3">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Save Global Changes</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                {/* Left Sidebar - Categories */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Configuration Tiers</p>
                        <nav className="space-y-3">
                            {[
                                { id: "general", label: "General Identity", icon: Globe },
                                { id: "layout", label: "Site Layout & Nav", icon: Palette },
                                { id: "security", label: "Access & Security", icon: Shield },
                                { id: "database", label: "Data Management", icon: Database },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all border ${activeTab === item.id
                                        ? "bg-[#003366] text-white border-transparent shadow-xl shadow-blue-900/10"
                                        : "bg-transparent text-slate-500 border-transparent hover:bg-slate-50/50"
                                        }`}
                                >
                                    <item.icon size={20} className={activeTab === item.id ? "text-red-400" : "text-slate-400"} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                                <Shield size={22} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-tight text-[#003366]">System Integrity</h4>
                                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Version 2.4.0-Stable</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                            "Last automated backup completed 4 hours ago. All administrative logs are synchronized."
                        </p>
                    </div>
                </div>

                {/* Right Content - Form */}
                <div className="lg:col-span-8 space-y-8">
                    {activeTab === 'general' && (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 animate-in fade-in slide-in-from-right-4">
                            <div className="mb-12">
                                <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">General Identity</h3>
                                <p className="text-sm text-slate-400 font-medium italic">Primary information displayed across customer portals</p>
                            </div>

                            <form className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Platform Name</label>
                                        <Input
                                            value={formData.site_name}
                                            onChange={e => setFormData({ ...formData, site_name: e.target.value })}
                                            className="bg-slate-50 border-slate-100 h-16 rounded-2xl text-[12px] font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Support Email</label>
                                        <Input
                                            value={formData.support_email}
                                            onChange={e => setFormData({ ...formData, support_email: e.target.value })}
                                            className="bg-slate-50 border-slate-100 h-16 rounded-2xl text-[12px] font-bold uppercase tracking-widest focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Headquarters Address</label>
                                    <textarea
                                        value={formData.office_address}
                                        onChange={e => setFormData({ ...formData, office_address: e.target.value })}
                                        className="w-full bg-slate-50 border-slate-100 rounded-[28px] px-8 py-6 text-[12px] font-bold uppercase tracking-widest focus:outline-none focus:ring-8 focus:ring-red-600/5 focus:border-red-600 transition-all min-h-[120px] text-[#003366]"
                                    />
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'layout' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            {/* Landing Page Sections */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12">
                                <div className="mb-8 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">Landing Page Sections</h3>
                                        <p className="text-sm text-slate-400 font-medium italic">Drag to reorder sections. Toggle visibility.</p>
                                    </div>
                                </div>

                                <DragDropContext onDragEnd={onDragEndSections}>
                                    <Droppable droppableId="sections">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                {landingSections.map((section, index) => (
                                                    <Draggable key={section.id} draggableId={section.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${snapshot.isDragging ? 'bg-red-50 border-red-200 shadow-lg' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                                                            >
                                                                <div className="flex items-center space-x-4">
                                                                    <div {...provided.dragHandleProps} className="text-slate-400 hover:text-[#003366] cursor-grab active:cursor-grabbing p-1">
                                                                        <GripVertical size={20} />
                                                                    </div>
                                                                    <span className={`text-xs font-black uppercase tracking-widest ${section.visible ? 'text-[#003366]' : 'text-slate-400 line-through decoration-slate-300'}`}>
                                                                        {section.label}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleSectionVisibility(section.id)}
                                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border ${section.visible ? 'bg-white text-green-600 border-green-100 hover:bg-green-50' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}
                                                                >
                                                                    {section.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>

                            {/* Navigation Links */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12">
                                <div className="mb-8">
                                    <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">Main Navigation</h3>
                                    <p className="text-sm text-slate-400 font-medium italic">Configure the order and visibility of links in the header navbar.</p>
                                </div>

                                <DragDropContext onDragEnd={onDragEndNavs}>
                                    <Droppable droppableId="navlinks">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                {navLinks.map((link, index) => (
                                                    <Draggable key={link.id} draggableId={link.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${snapshot.isDragging ? 'bg-[#003366]/5 border-[#003366]/20 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                                            >
                                                                <div className="flex items-center space-x-4">
                                                                    <div {...provided.dragHandleProps} className="text-slate-400 hover:text-[#003366] cursor-grab active:cursor-grabbing p-1">
                                                                        <GripVertical size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <span className={`block text-xs font-black uppercase tracking-widest ${link.visible ? 'text-[#003366]' : 'text-slate-400 line-through decoration-slate-300'}`}>
                                                                            {link.label}
                                                                        </span>
                                                                        <span className="block text-[9px] font-bold text-slate-400 font-mono tracking-tight lowercase">
                                                                            {link.href}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleNavVisibility(link.id)}
                                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border ${link.visible ? 'bg-white text-green-600 border-green-100 hover:bg-green-50' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}
                                                                >
                                                                    {link.visible ? <CheckSquare size={18} /> : <Square size={18} />}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </div>
                        </div>
                    )}

                    {!['general', 'layout'].includes(activeTab) && (
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center h-[500px]">
                            <Settings size={64} className="text-slate-200 mb-6" />
                            <h3 className="text-xl font-black text-[#003366] uppercase tracking-tight mb-2">Module Offline</h3>
                            <p className="text-sm text-slate-400 font-medium italic text-center max-w-sm">This configuration tier is currently locked pending the next enterprise deployment cycle.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
