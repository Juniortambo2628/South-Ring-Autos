import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Book,
    Plus,
    Edit,
    Trash2,
    DollarSign,
    ShoppingBag,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    Save,
    X,
    Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

const AdminJournals = () => {
    const [journals, setJournals] = useState([]);
    const [stats, setStats] = useState({ total_revenue: 0, total_sales: 0 });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState(null);
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        title: '',
        description: '',
        price: '',
        is_active: true,
        cover_image: null
    });
    const [processing, setProcessing] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('/api/admin/journals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // API Resource wraps data in 'data'
            if (response.data.data) {
                setJournals(response.data.data);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching journals:', error);
            addToast('Failed to load journals', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (journal = null) => {
        if (journal) {
            setEditingJournal(journal);
            setFormData({
                year: journal.year,
                title: journal.title,
                description: journal.description || '',
                price: journal.price,
                is_active: journal.is_active,
                cover_image: null
            });
        } else {
            setEditingJournal(null);
            setFormData({
                year: new Date().getFullYear(),
                title: '',
                description: '',
                price: '',
                is_active: true,
                cover_image: null
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        const data = new FormData();
        data.append('year', formData.year);
        data.append('title', formData.title);
        data.append('description', formData.description || '');
        data.append('price', formData.price);
        data.append('is_active', formData.is_active ? 1 : 0);
        if (formData.cover_image) {
            data.append('cover_image', formData.cover_image);
        }

        try {
            const token = localStorage.getItem('auth_token');
            let response;
            if (editingJournal) {
                response = await axios.post(`/api/admin/journals/${editingJournal.id}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            } else {
                response = await axios.post('/api/admin/journals', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            if (response.data.success) {
                addToast(editingJournal ? 'Journal updated successfully' : 'Journal created successfully', 'success');
                setModalOpen(false);
                fetchJournals();
            }
        } catch (error) {
            console.error('Error saving journal:', error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                Object.values(errors).flat().forEach(msg => {
                    addToast(msg, 'error');
                });
            } else {
                addToast(error.response?.data?.message || 'Failed to save journal', 'error');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this journal? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.delete(`/api/admin/journals/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                addToast('Journal deleted', 'success');
                fetchJournals();
            }
        } catch (error) {
            console.error('Error deleting journal:', error);
            addToast(error.response?.data?.message || 'Failed to delete journal', 'error');
        }
    };

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Journal <span className="text-red-600">Management</span></h1>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Monetize your archives through annual editions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    New Edition
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Revenue</p>
                        <h3 className="text-xl font-black text-slate-900">KES {stats.total_revenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Total Sales</p>
                        <h3 className="text-xl font-black text-slate-900">{stats.total_sales} Units</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Active Editions</p>
                        <h3 className="text-xl font-black text-slate-900">{journals.filter(j => j.is_active).length} Years</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Edition</th>
                                <th className="px-8 py-5">Year</th>
                                <th className="px-8 py-5">Price</th>
                                <th className="px-8 py-5">Sales</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Loader2 size={32} className="mx-auto text-red-600 animate-spin mb-4" />
                                        <p className="text-slate-400 font-bold uppercase text-xs">Loading Archives...</p>
                                    </td>
                                </tr>
                            ) : journals.length > 0 ? (
                                journals.map((journal) => (
                                    <tr key={journal.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                                    {journal.cover_image ? (
                                                        <img src={journal.cover_image} alt={journal.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Book size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 uppercase text-xs tracking-tight">{journal.title}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">{journal.description || 'No description...'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                                                {journal.year}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-slate-900 text-xs tracking-tighter">
                                            KES {journal.price.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-600 text-xs">
                                                {journal.purchases_count} Sold
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {journal.is_active ? (
                                                <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle size={14} className="mr-1.5" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    <XCircle size={14} className="mr-1.5" />
                                                    Hidden
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                <button
                                                    onClick={() => handleOpenModal(journal)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(journal.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <Book size={48} className="mx-auto text-slate-200 mb-4" />
                                        <h3 className="text-slate-400 font-black uppercase text-sm tracking-tight">No journals created yet</h3>
                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="mt-6 text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                        >
                                            Create your first edition
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !processing && setModalOpen(false)}></div>
                        <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingJournal ? 'Edit' : 'New'} <span className="text-red-600">Journal</span>
                                </h2>
                                <button onClick={() => !processing && setModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Edition Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:outline-none font-bold"
                                            placeholder="2025"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:outline-none font-bold"
                                            placeholder="2500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:outline-none font-bold italic"
                                        placeholder="The 2025 Performance Archive"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:outline-none font-medium text-sm min-h-[100px]"
                                        placeholder="Briefly describe what's inside this edition..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cover Image</label>
                                    <div className="flex items-center space-x-4">
                                        <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-red-600/50 transition-colors cursor-pointer group">
                                            <div className="flex items-center space-x-2 text-slate-400 group-hover:text-red-600">
                                                <ImageIcon size={20} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {formData.cover_image ? formData.cover_image.name : 'Upload Cover'}
                                                </span>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => setFormData({ ...formData, cover_image: e.target.files[0] })}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-10 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Set as Active (Visible in Store)</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl shadow-slate-900/20"
                                >
                                    {processing ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Save Journal Edition
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

// Help for AnimatePresence if not available
const AnimatePresence = ({ children }) => children;

export default AdminJournals;
