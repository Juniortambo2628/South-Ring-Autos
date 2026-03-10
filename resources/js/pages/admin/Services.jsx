import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Check,
    X,
    Star,
    Image as ImageIcon,
    Wrench
} from 'lucide-react';
import axios from 'axios';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '',
        image: '',
        is_featured: false
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/services');
            if (response.data.success) {
                setServices(response.data.services);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                title: service.title,
                description: service.description || '',
                icon: service.icon || '',
                image: service.image || '',
                is_featured: service.is_featured
            });
        } else {
            setEditingService(null);
            setFormData({
                title: '',
                description: '',
                icon: '',
                image: '',
                is_featured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await axios.patch(`/api/services/${editingService.id}`, formData);
            } else {
                await axios.post('/api/services', formData);
            }
            setIsModalOpen(false);
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await axios.delete(`/api/services/${id}`);
                fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Services</h1>
                    <p className="text-slate-500">Add, edit or remove services offered by South Ring Autos.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                    <Plus size={20} className="mr-2" /> Add New Service
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider font-bold">
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Featured</th>
                                <th className="px-6 py-4">Icon/Image</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 w-10 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900">{service.title}</div>
                                            <div className="text-sm text-slate-500 line-clamp-1">{service.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {service.is_featured ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    <Star size={12} className="mr-1 fill-amber-700" /> Featured
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {service.image ? (
                                                <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden">
                                                    <img src={service.image} className="w-full h-full object-cover" />
                                                </div>
                                            ) : service.icon ? (
                                                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                                    <Wrench size={20} className="text-slate-500" />
                                                </div>
                                            ) : (
                                                <ImageIcon size={20} />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(service)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No services found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Service Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    placeholder="e.g., Engine Overhaul"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    placeholder="Brief description of the service..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Icon Name</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                        placeholder="e.g., Wrench"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 uppercase tracking-wider">Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                        placeholder="/images/example.jpg"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 py-2">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 shadow-sm"
                                />
                                <label htmlFor="is_featured" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Featured on Home Page</label>
                            </div>
                            <div className="pt-4 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                                >
                                    {editingService ? 'Save Changes' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Services;
