import React, { useState, useEffect } from 'react';
import {
    Car,
    Plus,
    Edit2,
    Trash2,
    AlertCircle,
    Info,
    Fuel,
    Settings as Engine,
    Calendar,
    Search,
    X,
    Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClientLayout from '../../layouts/ClientLayout';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../../components/Skeletons';

const Vehicles = () => {
    const { addToast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        registration: '',
        color: '',
        vin: '',
        engine_size: '',
        fuel_type: '',
        mileage: '',
        notes: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/client/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // API Resource returns data in .data.data
            setVehicles(response.data.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            addToast('Failed to load vehicle garage.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (vehicle = null) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                make: vehicle.make || '',
                model: vehicle.model || '',
                year: vehicle.year || '',
                registration: vehicle.registration || '',
                color: vehicle.color || '',
                vin: vehicle.vin || '',
                engine_size: vehicle.engine_size || '',
                fuel_type: vehicle.fuel_type || '',
                mileage: vehicle.mileage || '',
                notes: vehicle.notes || ''
            });
        } else {
            setEditingVehicle(null);
            setFormData({
                make: '',
                model: '',
                year: '',
                registration: '',
                color: '',
                vin: '',
                engine_size: '',
                fuel_type: '',
                mileage: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            let response;
            if (editingVehicle) {
                // response = await axios.put(`/api/client/vehicles/${editingVehicle.id}`, formData, {
                //     headers: { Authorization: `Bearer ${token}` }
                // });
                addToast('Update functionality is coming soon!', 'info');
                setSaving(false);
                return;
            } else {
                response = await axios.post('/api/client/vehicles', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            if (response.data.success) {
                addToast('Vehicle added successfully!', 'success');
                fetchVehicles();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error saving vehicle:', error);
            const message = error.response?.data?.message || 'Error saving vehicle';
            addToast(message, 'error');

            // Handle validation errors specifically
            if (error.response?.status === 422 && error.response.data.errors) {
                const firstError = Object.values(error.response.data.errors)[0][0];
                addToast(firstError, 'error');
            }
        } finally {
            setSaving(false);
        }
    };

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
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">My Vehicles</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage your garage and vehicle details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/10 flex items-center justify-center"
                >
                    <Plus size={16} className="mr-2" /> Add Vehicle
                </button>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <div className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                        <div className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                        <div className="h-64 bg-white rounded-3xl border border-slate-100 animate-pulse"></div>
                    </>
                ) : vehicles.length > 0 ? (
                    vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                            <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-50 relative">
                                <Car size={64} className="text-slate-200" />
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(vehicle)}
                                        className="p-2 bg-white rounded-xl shadow-sm text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200">
                                        {vehicle.registration}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-4">{vehicle.make} {vehicle.model}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                                    <div className="flex items-center space-x-2 text-slate-600 font-bold">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span>{vehicle.year || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-600 font-bold">
                                        <Fuel size={14} className="text-slate-400" />
                                        <span>{vehicle.fuel_type || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-600 font-bold">
                                        <Engine size={14} className="text-slate-400" />
                                        <span>{vehicle.engine_size || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-600 font-bold">
                                        <AlertCircle size={14} className="text-slate-400" />
                                        <span>{vehicle.mileage ? `${parseInt(vehicle.mileage).toLocaleString()} km` : 'N/A'}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/dashboard/bookings?search=${vehicle.registration}`}
                                    className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                >
                                    <Clock size={14} />
                                    <span>Service History</span>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white py-20 rounded-3xl border border-dashed border-slate-200 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Car size={40} />
                        </div>
                        <h3 className="text-slate-900 font-bold mb-1">Your garage is empty</h3>
                        <p className="text-slate-500 text-sm font-medium mb-6">Add your first vehicle to start tracking services.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all inline-flex items-center"
                        >
                            <Plus size={16} className="mr-2" /> Add Your First Vehicle
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-slide-up my-8">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <Car className="text-red-500" />
                                <h2 className="text-xl font-black">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Make *</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="e.g., Toyota"
                                        value={formData.make}
                                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Model *</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="e.g., Land Cruiser"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Registration *</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all uppercase"
                                        placeholder="e.g., KCA 123A"
                                        value={formData.registration}
                                        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Year</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="e.g., 2020"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Color</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="e.g., Silver"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Fuel Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        value={formData.fuel_type}
                                        onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                                    >
                                        <option value="">Select Fuel...</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Hybrid">Hybrid</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Engine Size</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        placeholder="e.g., 2000cc"
                                        value={formData.engine_size}
                                        onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">Current Mileage (km)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        value={formData.mileage}
                                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block px-1">VIN Number</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all uppercase"
                                        value={formData.vin}
                                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-grow bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-grow-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        <><Save size={16} className="mr-2" /> {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default Vehicles;
