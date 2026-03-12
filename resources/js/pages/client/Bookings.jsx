import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Search,
    Filter,
    ChevronRight,
    Clock,
    Wrench,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    FileText,
    MapPin,
    ExternalLink,
    X,
    CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout';
import { useToast } from '../../context/ToastContext';
import { SkeletonRow } from '../../components/Skeletons';

const Bookings = () => {
    const { addToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/client/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // API Resource returns data in .data.data
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            addToast('Failed to load bookings history.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
        'in_progress': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'cancelled': 'bg-slate-100 text-slate-600 border-slate-200',
    };

    const StatusBadge = ({ status }) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[status] || 'bg-slate-100 text-slate-600'}`}>
            {status.replace('_', ' ')}
        </span>
    );

    const filteredBookings = bookings.filter(booking => {
        const matchesFilter = filter === 'all' || booking.status === filter;
        const searchStr = `${booking.service} ${booking.vehicle?.make} ${booking.vehicle?.model} ${booking.registration}`.toLowerCase();
        const matchesSearch = searchStr.includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">My Bookings</h1>
                    <p className="text-sm text-slate-500 font-medium">View and track your vehicle service history.</p>
                </div>
                <Link to="/booking" className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center justify-center">
                    <Calendar size={16} className="mr-2" /> New Booking
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search bookings..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                    {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === s
                                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {loading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
                            onClick={() => setSelectedBooking(booking)}
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-inner">
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="text-lg font-black text-slate-900">{booking.service}</h3>
                                                <StatusBadge status={booking.status} />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 flex items-center">
                                                <Car size={16} className="mr-1.5 text-slate-400" />
                                                {booking.vehicle?.make} {booking.vehicle?.model || booking.registration}
                                                <span className="mx-2 text-slate-300">•</span>
                                                <Clock size={16} className="mr-1.5 text-slate-400" />
                                                {new Date(booking.date || booking.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Reference</p>
                                            <p className="font-mono text-sm font-bold text-slate-700">SRA-{booking.id.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-red-50 transition-colors">
                                            <ChevronRight size={24} className="text-slate-300 group-hover:text-red-600 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">No bookings found</h3>
                        <p className="text-slate-500 text-sm font-medium">Try adjusting your filters or make a new booking.</p>
                    </div>
                )}
            </div>

            {/* Booking Detail Modal (Simplified Overlay) */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center sticky top-0 z-10">
                            <div className="flex items-center space-x-3">
                                <FileText className="text-red-500" />
                                <div>
                                    <h2 className="text-xl font-black">Booking Details</h2>
                                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">SRA-{selectedBooking.id.toString().padStart(6, '0')}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Summary Card */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Type</p>
                                    <p className="font-bold text-slate-900">{selectedBooking.service}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <StatusBadge status={selectedBooking.status} />
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2 flex items-center">
                                    <Car size={14} className="mr-2" /> Vehicle Information
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Vehicle</p>
                                        <p className="font-bold text-slate-800">{selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Registration</p>
                                        <p className="font-bold text-slate-800 uppercase">{selectedBooking.registration}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2 flex items-center">
                                    <Calendar size={14} className="mr-2" /> Schedule & Notes
                                </h3>
                                <div className="grid grid-cols-2 gap-6 mb-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Booking Date</p>
                                        <p className="font-bold text-slate-800">{new Date(selectedBooking.date || selectedBooking.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Preferred Time</p>
                                        <p className="font-bold text-slate-800">{selectedBooking.time || 'Flexible'}</p>
                                    </div>
                                </div>
                                {selectedBooking.message && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Message</p>
                                        <div className="bg-slate-50 p-4 rounded-xl text-sm font-medium text-slate-600 border border-slate-100">
                                            {selectedBooking.message}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Costs */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2 flex items-center">
                                    <CreditCard size={14} className="mr-2" /> Cost Information
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Estimated Cost</p>
                                        <p className="font-bold text-slate-800">{selectedBooking.estimated_cost ? `KES ${parseFloat(selectedBooking.estimated_cost).toLocaleString()}` : 'TBD'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Final Cost</p>
                                        <p className="font-bold text-red-600">{selectedBooking.actual_cost ? `KES ${parseFloat(selectedBooking.actual_cost).toLocaleString()}` : '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center"
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default Bookings;
