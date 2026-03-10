import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    CalendarDays,
    FileText,
    MessageSquare,
    TrendingUp,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trendValue}%
                </div>
            )}
        </div>
        <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        totalPosts: 0,
        newMessages: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        // Mock data for now until API is ready
        setTimeout(() => {
            setStats({
                totalBookings: 156,
                pendingBookings: 12,
                totalPosts: 24,
                newMessages: 8
            });
            setRecentBookings([
                { id: 1, name: 'John Doe', service: 'Oil Change', registration: 'KBY 123X', date: '2026-02-18', status: 'pending' },
                { id: 2, name: 'Jane Smith', service: 'Engine Repair', registration: 'KCC 456Y', date: '2026-02-19', status: 'confirmed' },
                { id: 3, name: 'Alex Johnson', service: 'Diagnostics', registration: 'KDD 789Z', date: '2026-02-18', status: 'confirmed' },
                { id: 4, name: 'Michael Brown', service: 'General Service', registration: 'KBZ 555H', date: '2026-02-20', status: 'cancelled' },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">System Overview</h1>
                    <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center shadow-sm">
                        <Clock size={18} className="mr-2" /> Last 7 Days
                    </button>
                    <Link to="/admin/bookings" className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 hover:-translate-y-0.5">
                        New Booking
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200"></div>
                    ))}
                </div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    <motion.div variants={item}>
                        <StatCard
                            title="Total Bookings"
                            value={stats.totalBookings}
                            icon={CalendarDays}
                            color="blue"
                            trend="up"
                            trendValue="12.5"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            title="Pending Service"
                            value={stats.pendingBookings}
                            icon={TrendingUp}
                            color="orange"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            title="New Messages"
                            value={stats.newMessages}
                            icon={MessageSquare}
                            color="green"
                            trend="down"
                            trendValue="5.2"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            title="Blog Articles"
                            value={stats.totalPosts}
                            icon={FileText}
                            color="purple"
                        />
                    </motion.div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Recent Appointments</h2>
                            <Link to="/admin/bookings" className="text-red-600 font-bold text-sm hover:underline flex items-center">
                                View All <ChevronRight size={16} className="ml-1" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Service</th>
                                        <th className="px-6 py-4">Reg No.</th>
                                        <th className="px-6 py-4 text-center">Date</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">
                                                        {booking.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{booking.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">{booking.service}</td>
                                            <td className="px-6 py-4 text-sm font-mono font-bold text-slate-500">{booking.registration}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 text-center">{booking.date}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Activity */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-900 text-lg uppercase tracking-tight mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform mb-3">
                                    <UserPlus size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase">Add Client</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform mb-3">
                                    <FileText size={20} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase">New Post</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-900 text-lg uppercase tracking-tight mb-6">Recent Activity</h2>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex space-x-4 relative">
                                    {i !== 3 && <div className="absolute left-2.5 top-8 bottom-0 w-px bg-slate-100"></div>}
                                    <div className="w-5 h-5 rounded-full bg-red-100 border-4 border-red-50 flex-shrink-0 z-10"></div>
                                    <div>
                                        <p className="text-sm text-slate-900 font-bold italic leading-tight mb-1">New booking received for KCC 456Y</p>
                                        <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">2 hours ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
