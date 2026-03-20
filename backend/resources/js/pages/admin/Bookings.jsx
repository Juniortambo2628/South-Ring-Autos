import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Search,
    Filter,
    ChevronDown,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    RotateCcw,
    Mail,
    Phone,
    Calendar,
    Clock,
    Car,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/bookings');
            if (response.data.success) {
                setBookings(response.data.bookings);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setUpdating(id);
        try {
            const response = await axios.patch(`/api/bookings/${id}/status`, { status });
            if (response.data.success) {
                setBookings(bookings.map(b => b.id === id ? response.data.booking : b));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = filter === 'all' || b.status === filter;
        const searchLower = search.toLowerCase();
        const matchesSearch =
            b.name.toLowerCase().includes(searchLower) ||
            b.registration.toLowerCase().includes(searchLower) ||
            b.service.toLowerCase().includes(searchLower);
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Booking Management</h1>
                    <p className="text-slate-500 font-medium italic">Track and manage vehicle service appointments.</p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, registration, or service..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative w-full lg:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none appearance-none font-bold text-slate-700 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Fetching Bookings...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-6 py-4">Client Detail</th>
                                    <th className="px-6 py-4">Vehicle Detail</th>
                                    <th className="px-6 py-4">Service Required</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-6">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg mr-4 border-2 border-white shadow-sm">
                                                        {booking.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 leading-none mb-1">{booking.name}</div>
                                                        <div className="flex flex-col text-xs text-slate-500 font-medium">
                                                            <span className="flex items-center"><Phone size={10} className="mr-1" /> {booking.phone}</span>
                                                            <span className="flex items-center"><Mail size={10} className="mr-1" /> {booking.email || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-mono">
                                                <div className="font-bold text-red-600 mb-1">{booking.registration}</div>
                                                <div className="text-xs text-slate-500 font-bold uppercase italic">
                                                    {booking.vehicle?.make} {booking.vehicle?.model}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 uppercase">
                                                    {booking.service}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center text-sm font-bold text-slate-600">
                                                    <Calendar size={14} className="mr-2 text-slate-400" />
                                                    {booking.date ? new Date(booking.date).toLocaleDateString() : 'TBD'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 flex items-center">
                                                    <Clock size={10} className="mr-1" /> {booking.preferred_time || 'Morning'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${getStatusColor(booking.status)} shadow-sm`}>
                                                    {booking.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    {updating === booking.id ? (
                                                        <div className="animate-spin w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                                                    ) : (
                                                        <>
                                                            {booking.status === 'pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Confirm Booking"
                                                                >
                                                                    <CheckCircle size={20} />
                                                                </button>
                                                            )}
                                                            {booking.status === 'confirmed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Mark as Completed"
                                                                >
                                                                    <CheckCircle size={20} />
                                                                </button>
                                                            )}
                                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Cancel Booking"
                                                                >
                                                                    <XCircle size={20} />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye size={20} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center">
                                            <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
                                            <h3 className="text-slate-900 font-bold text-lg">No bookings found</h3>
                                            <p className="text-slate-500 italic">Try adjusting your filters or search query.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminBookings;
