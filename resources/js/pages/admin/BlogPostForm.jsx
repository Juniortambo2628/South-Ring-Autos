import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    ChevronLeft,
    Save,
    X,
    Image as ImageIcon,
    Layout as LayoutIcon,
    Type,
    FileText as FileTextIcon,
    CheckCircle,
    AlertCircle,
    Upload
} from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminBlogPostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Maintenance',
        image: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (isEdit) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await axios.get(`/api/blog/${id}`);
            if (response.data.success) {
                setFormData(response.data.post);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setStatus({ type: 'error', message: 'Failed to load post data' });
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const url = isEdit ? `/api/blog/${id}` : '/api/blog';
            const method = isEdit ? 'patch' : 'post';

            const response = await axios[method](url, formData);

            if (response.data.success) {
                setStatus({ type: 'success', message: `Post ${isEdit ? 'updated' : 'created'} successfully!` });
                setTimeout(() => navigate('/admin/blog'), 1500);
            }
        } catch (error) {
            console.error('Error saving post:', error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Failed to save post' });
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Maintenance', 'Repair', 'TIPS', 'Events', 'General'];

    if (fetching) return (
        <AdminLayout>
            <div className="p-20 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm italic">Loading Article Detail...</p>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/blog" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                            {isEdit ? 'Edit Article' : 'New Article'}
                        </h1>
                        <p className="text-slate-500 font-medium italic">Craft a compelling story for your audience.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/admin/blog')}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        form="blog-post-form"
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center disabled:opacity-70 group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                        ) : (
                            <Save size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                        )}
                        {isEdit ? 'Save Changes' : 'Publish Story'}
                    </button>
                </div>
            </div>

            {status.message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 p-4 rounded-xl border flex items-center space-x-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                >
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold uppercase tracking-tight text-sm">{status.message}</span>
                </motion.div>
            )}

            <form id="blog-post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                <Type size={14} className="mr-2" /> Article Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter a catchy title..."
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-xl font-bold placeholder:text-slate-300"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                <FileTextIcon size={14} className="mr-2" /> Short Excerpt
                            </label>
                            <textarea
                                rows="3"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                placeholder="Write a brief summary for the preview..."
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-slate-300 italic"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                <LayoutIcon size={14} className="mr-2" /> Full Content
                            </label>
                            <textarea
                                required
                                rows="15"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Tell your story here..."
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium leading-relaxed placeholder:text-slate-300"
                            ></textarea>
                            <p className="text-xs text-slate-400 font-bold uppercase italic">Supports plain text/HTML formatting.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Publishing Status</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'draft' })}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all uppercase tracking-tight ${formData.status === 'draft' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: 'published' })}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all uppercase tracking-tight ${formData.status === 'published' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Published
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-bold text-slate-700"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                            <ImageIcon size={14} className="mr-2" /> Cover Image
                        </label>
                        <div className="relative group">
                            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                                {formData.image ? (
                                    <>
                                        <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: '' })}
                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">Enter Image URL Below</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-xs font-mono font-bold"
                        />
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AdminBlogPostForm;
