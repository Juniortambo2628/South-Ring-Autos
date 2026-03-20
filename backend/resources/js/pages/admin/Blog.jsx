import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    ExternalLink,
    FileText,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBlog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/blog?admin=1');
            if (response.data.success) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setDeleting(id);
        try {
            const response = await axios.delete(`/api/blog/${id}`);
            if (response.data.success) {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post');
        } finally {
            setDeleting(null);
        }
    };

    const filteredPosts = posts.filter(p => {
        const matchesCategory = category === 'all' || p.category === category;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['Maintenance', 'Repair', 'TIPS', 'Events', 'General'];

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Blog Management</h1>
                    <p className="text-slate-500 font-medium italic">Create and manage your articles and news updates.</p>
                </div>
                <Link to="/admin/blog/new" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center group">
                    <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" />
                    Create New Post
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles by title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                    />
                </div>
                <div className="relative w-full lg:w-48">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none appearance-none font-bold text-slate-700 cursor-pointer"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Articles...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Article</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPosts.length > 0 ? (
                                    filteredPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="hidden sm:block w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mr-4">
                                                        {post.image ? (
                                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                <FileText size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="max-w-md">
                                                        <div className="font-bold text-slate-900 truncate">{post.title}</div>
                                                        <div className="text-xs text-slate-500 italic truncate">{post.excerpt || 'No excerpt provided...'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-600 uppercase tracking-tight">{post.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${post.status === 'published'
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-orange-100 text-orange-700 border-orange-200'
                                                    }`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-bold text-slate-500">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link
                                                        to={`/admin/blog/edit/${post.id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Article"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        disabled={deleting === post.id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Delete Article"
                                                    >
                                                        {deleting === post.id ? (
                                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                    <a
                                                        href={`/blog/${post.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Preview Publicly"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
                                            <h3 className="text-slate-900 font-bold text-lg">No articles found</h3>
                                            <p className="text-slate-500 italic">Try searching for something else or create a new post.</p>
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

export default AdminBlog;
