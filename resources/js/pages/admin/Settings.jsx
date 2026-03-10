import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Save, Loader2, CheckCircle2, AlertCircle, Building2, Phone, Mail, MapPin, Globe } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [settings, setSettings] = useState({
        company_name: '',
        phone: '',
        email: '',
        address: '',
        working_hours: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
        meta_description: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/settings');
            if (response.data.success) {
                const fetchedSettings = response.data.settings;
                setSettings(prev => ({
                    ...prev,
                    ...fetchedSettings
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await axios.post('/api/settings', { settings });
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">General Settings</h1>
                    <p className="text-slate-500">Manage your company information and site-wide configurations.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="mr-3" size={20} /> : <AlertCircle className="mr-3" size={20} />}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                            <Building2 className="mr-3 text-red-600" size={20} /> Company Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Company Name</label>
                                <input
                                    type="text"
                                    value={settings.company_name}
                                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Business Address</label>
                                <textarea
                                    rows="3"
                                    value={settings.address}
                                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Working Hours</label>
                                <input
                                    type="text"
                                    value={settings.working_hours}
                                    onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                                    placeholder="e.g., Mon - Fri: 8am - 6pm"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                            <Phone className="mr-3 text-red-600" size={20} /> Contact Details
                        </h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={settings.phone}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={settings.email}
                                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-tight">Social Links</label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-24 text-xs font-bold text-slate-500 uppercase tracking-widest">Facebook</span>
                                        <input
                                            type="text"
                                            value={settings.facebook_url}
                                            onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all"
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="w-24 text-xs font-bold text-slate-500 uppercase tracking-widest">Instagram</span>
                                        <input
                                            type="text"
                                            value={settings.instagram_url}
                                            onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all"
                                            placeholder="https://instagram.com/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pb-12">
                    <button
                        type="button"
                        onClick={fetchSettings}
                        className="px-8 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                    >
                        Discard Changes
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-12 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin mr-3" size={20} /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-3" size={20} /> Save Settings
                            </>
                        )}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
};

export default Settings;
