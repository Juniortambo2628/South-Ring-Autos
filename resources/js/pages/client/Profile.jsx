import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Shield,
    Save,
    AlertCircle,
    CheckCircle2,
    Clock,
    Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout';
import { useToast } from '../../context/ToastContext';

const Profile = () => {
    const { addToast } = useToast();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put('/api/client/profile', profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                addToast('Profile updated successfully!', 'success');
                const updatedUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update profile';
            addToast(message, 'error');
            if (err.response?.status === 422 && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                addToast(firstError, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.put('/api/client/profile', {
                ...profileData,
                ...passwordData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                addToast('Password changed successfully!', 'success');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to change password';
            addToast(message, 'error');
            if (err.response?.status === 422 && err.response.data.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                addToast(firstError, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Profile Settings</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your personal information and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center space-x-2">
                            <User size={20} className="text-red-600" />
                            <h2 className="text-lg font-black text-slate-900">Personal Details</h2>
                        </div>
                        <form onSubmit={handleProfileSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text" required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Email (Read Only)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email" disabled
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
                                            value={user?.email}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                                        <textarea
                                            rows="3"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all text-slate-900 no-scrollbar"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center shadow-lg shadow-slate-900/10 disabled:opacity-50"
                                >
                                    {loading ? <Clock className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />}
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center space-x-2">
                            <Lock size={20} className="text-red-600" />
                            <h2 className="text-lg font-black text-slate-900">Security</h2>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        value={passwordData.new_password_confirmation}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-slate-100 text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center disabled:opacity-50"
                                >
                                    {loading && <Clock className="animate-spin mr-2" size={16} />}
                                    {loading ? 'Processing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <section className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="h-24 w-24 rounded-full bg-red-600 flex items-center justify-center font-black text-4xl border-4 border-slate-800 shadow-xl mb-6 shadow-red-600/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <h2 className="text-xl font-black mb-1 text-center">{user?.name}</h2>
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-6">Verified Client</p>

                            <div className="w-full space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Joined</span>
                                    <span className="text-sm font-bold">{new Date(user?.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status</span>
                                    <div className="flex items-center text-emerald-500">
                                        <Shield size={14} className="mr-1.5" />
                                        <span className="text-sm font-bold">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 text-white/5 opacity-10">
                            <Shield size={180} />
                        </div>
                    </section>

                    <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-2">
                        <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center">
                            <AlertCircle size={14} className="mr-2 text-red-600" /> Need Help?
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            For security reasons, email addresses can only be changed by contacting our administrative team directly.
                        </p>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default Profile;
