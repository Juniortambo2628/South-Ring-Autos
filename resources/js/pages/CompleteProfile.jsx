import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { motion } from 'framer-motion';
import { Phone, MapPin, CheckCircle2, Loader2, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CompleteProfile = () => {
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
    });
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/user/complete-profile', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            if (response.data.success) {
                // Update local storage user
                const updatedUser = { ...user, ...formData, profile_completed: true };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                navigate('/admin');
            }
        } catch (err) {
            console.error('Profile completion failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-20 px-4 bg-slate-50 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <User className="text-red-600" size={40} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Complete Your Profile</h1>
                            <p className="text-slate-500 font-medium italic">We just need a few more details to get you started, {user.name}.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-medium"
                                        placeholder="+254 7XX XXX XXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Physical Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-600/10 focus:border-red-600 transition-all font-medium"
                                        placeholder="Enter your location or delivery address"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                Save & Continue
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default CompleteProfile;
