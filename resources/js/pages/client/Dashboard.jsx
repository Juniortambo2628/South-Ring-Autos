import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Wrench,
    CheckCircle2,
    Clock,
    Car,
    ArrowRight,
    CalendarPlus,
    User,
    Receipt,
    Truck,
    Info,
    Wallet,
    ChevronRight,
    X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout';
import { useToast } from '../../context/ToastContext';
import { Skeleton, SkeletonCard } from '../../components/Skeletons';

const Dashboard = () => {
    const { addToast } = useToast();
    const [stats, setStats] = useState({
        active_bookings: 0,
        completed_bookings: 0,
        vehicle_count: 0,
        total_spent: 0,
        pending_payment: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const headers = { Authorization: `Bearer ${token}` };
                const [statsRes, bookingsRes] = await Promise.all([
                    axios.get('/api/client/stats', { headers }),
                    axios.get('/api/client/bookings', { headers })
                ]);

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }

                // Bookings are now returned via Resource collection, so they are in .data.data
                setRecentBookings(bookingsRes.data.data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                addToast('Failed to load dashboard data. Please refresh.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const cards = [
        {
            label: 'Total Spent',
            value: `KES ${stats?.total_spent?.toLocaleString() || 0}`,
            icon: Wallet,
            color: 'bg-red-50 text-red-600'
        },
        {
            label: 'Active Repairs',
            value: stats?.active_bookings || 0,
            icon: Wrench,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            label: 'Completed',
            value: stats?.completed_bookings || 0,
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600'
        },
        {
            label: 'Pending Payment',
            value: `KES ${stats?.pending_payment?.toLocaleString() || 0}`,
            icon: Clock,
            color: 'bg-amber-50 text-amber-600'
        },
    ];

    if (loading) {
        return (
            <ClientLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            {/* Welcome Header */}
            <div className="mb-8 p-8 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl text-white shadow-xl shadow-red-900/10 flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2 animate-fade-in">Jambo, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-red-100 font-medium">Track your vehicle repairs and services from your personalized dashboard.</p>
                </div>
                <div className="hidden md:block absolute right-0 top-0 h-full w-1/3 opacity-20 transform translate-x-12 translate-y-4">
                    <Car size={160} strokeWidth={1} />
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    cards.map((card, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow group">
                            <div className={`${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{card.label}</p>
                                <h3 className="text-xl font-black text-slate-900">{card.value}</h3>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Bookings (Main Section) */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <Wrench size={20} className="text-red-600" />
                                <h2 className="text-lg font-black text-slate-900">Recent Bookings</h2>
                            </div>
                            <Link to="/dashboard/bookings" className="text-sm font-black text-red-600 hover:text-red-700 flex items-center group">
                                View All <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="p-6">
                            {bookings.length > 0 ? (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300 group">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-600 shadow-sm">
                                                    <Car size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{booking.vehicle?.make} {booking.vehicle?.model || booking.registration}</h4>
                                                    <p className="text-xs text-slate-500 font-medium">{booking.service} • {new Date(booking.date || booking.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        booking.status === 'cancelled' ? 'bg-slate-200 text-slate-600' :
                                                            'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {booking.status.replace('_', ' ')}
                                                </span>
                                                <ChevronRight size={20} className="text-slate-300 group-hover:text-red-600 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Wrench size={40} />
                                    </div>
                                    <h3 className="text-slate-900 font-bold mb-1">No bookings found</h3>
                                    <p className="text-slate-500 text-sm mb-6 font-medium">You haven't made any service bookings yet.</p>
                                    <Link to="/booking" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all inline-flex items-center">
                                        <CalendarPlus size={16} className="mr-2" /> Book Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar (Quick Actions & Account) */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center space-x-2">
                            <TrendingUp size={20} className="text-red-600" />
                            <h2 className="text-lg font-black text-slate-900">Quick Actions</h2>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            {[
                                { name: 'Book Service', icon: CalendarPlus, link: '/booking', color: 'bg-red-50 text-red-600' },
                                { name: 'My Vehicles', icon: Car, link: '/dashboard/vehicles', color: 'bg-blue-50 text-blue-600' },
                                { name: 'Payment History', icon: Receipt, link: '/dashboard/payments', color: 'bg-emerald-50 text-emerald-600' },
                                { name: 'My Profile', icon: User, link: '/dashboard/profile', color: 'bg-amber-50 text-amber-600' },
                                { name: 'Requests', icon: Truck, link: '/dashboard/requests', color: 'bg-purple-50 text-purple-600' },
                                { name: 'Help Center', icon: Info, link: '/contact', color: 'bg-slate-100 text-slate-600' },
                            ].map((action, idx) => (
                                <Link key={idx} to={action.link} className="flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                                    <div className={`${action.color} p-3 rounded-xl mb-2 transition-transform group-hover:scale-110`}>
                                        <action.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight text-center text-slate-700 leading-tight">{action.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Account Info Card */}
                    <section className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20 px-8">
                        <h2 className="text-lg font-black mb-6 flex items-center">
                            <User size={20} className="mr-2 text-red-500" /> Account Info
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Email Address</p>
                                <p className="font-bold truncate text-sm">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Phone Number</p>
                                <p className="font-bold text-sm">{user?.phone || 'Not provided'}</p>
                            </div>
                            {user?.address && (
                                <div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Location</p>
                                    <p className="font-bold text-sm line-clamp-2">{user?.address}</p>
                                </div>
                            )}
                            <Link to="/dashboard/profile" className="block w-full text-center py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-xs font-black uppercase tracking-widest">
                                Manage Account
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </ClientLayout>
    );
};

// Re-using ChevronRight as it was missed in imports but used in JSX
const ChevronRight = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default Dashboard;
