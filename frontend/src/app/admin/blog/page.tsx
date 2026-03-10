"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
    Plus, Search, Edit2, Trash2, Calendar,
    User, Eye, Loader2, FileText, Grid, List as ListIcon, CheckSquare, Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<number | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'a-z'>('newest');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await api.get("/blog?admin=true");
            setPosts(response.data.posts || []);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await MySwal.fire({
            title: 'Delete Post?',
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        setDeleting(id);
        try {
            await api.delete(`/blog/${id}`);
            fetchPosts();
            setSelectedIds(prev => prev.filter(selId => selId !== id));
        } catch (err) {
            console.error("Failed to delete post", err);
        } finally {
            setDeleting(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        const result = await MySwal.fire({
            title: `Delete ${selectedIds.length} Posts?`,
            text: "This action cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete them!'
        });

        if (!result.isConfirmed) return;

        try {
            await Promise.all(selectedIds.map(id => api.delete(`/blog/${id}`)));
            setSelectedIds([]);
            fetchPosts();
            MySwal.fire('Deleted!', 'Selected posts have been deleted.', 'success');
        } catch (err) {
            console.error("Failed to delete posts", err);
            MySwal.fire('Error', 'Failed to delete some posts.', 'error');
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredPosts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredPosts.map(p => p.id));
        }
    };

    const categories = ['all', ...Array.from(new Set(posts.map(p => p.category || "Uncategorized")))];

    let filteredPosts = posts.filter(p =>
        (p.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) &&
        (filterCategory === 'all' || (p.category || "Uncategorized") === filterCategory)
    );

    filteredPosts = filteredPosts.sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortOrder === 'a-z') return (a.title || "").localeCompare(b.title || "");
        return 0;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-red-100">Content Management</span>
                    </div>
                    <h2 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">Article Repository</h2>
                    <p className="text-slate-500 font-medium italic">Publish and manage automotive insights and company news</p>
                </div>

                <Link href="/admin/blog/create">
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all flex items-center space-x-3">
                        <Plus size={18} />
                        <span>Write New Post</span>
                    </button>
                </Link>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full md:w-[300px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-slate-100 pl-10 h-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-red-600/10 focus:border-red-600 transition-all shadow-none"
                            placeholder="Search articles..."
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            {categories.map(cat => (
                                <option key={cat as string} value={cat as string}>{cat === 'all' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                        <select
                            value={sortOrder}
                            onChange={e => setSortOrder(e.target.value as any)}
                            className="bg-slate-50 border-slate-100 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#003366] focus:outline-none focus:ring-2 focus:ring-red-600/20 w-full md:w-auto"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="a-z">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                    <button onClick={selectAll} className="text-[10px] font-black uppercase text-slate-400 hover:text-[#003366] tracking-widest flex items-center gap-2">
                        {selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? <CheckSquare size={14} className="text-red-600" /> : <Square size={14} />} Select All
                    </button>
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                            <Grid size={14} />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-[#003366]'}`}>
                            <ListIcon size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Menu */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#003366] text-white rounded-2xl p-4 mb-8 flex items-center justify-between shadow-xl shadow-[#003366]/10"
                    >
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest pl-4">
                            <span className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center">{selectedIds.length}</span>
                            Articles Selected
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedIds([])} className="px-6 h-10 rounded-xl hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest">Cancel</button>
                            <button onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700 h-10 px-6 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Trash2 size={14} /> Delete Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>
            ) : filteredPosts.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl py-24 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-200">
                        <FileText size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No articles found</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosts.map(post => (
                        <div key={post.id} className={`bg-white rounded-3xl border transition-all duration-300 relative group overflow-hidden ${selectedIds.includes(post.id) ? 'border-red-600 shadow-md shadow-red-600/10' : 'border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'}`}>
                            {/* Card Selection */}
                            <div className="absolute top-4 left-4 z-10 text-white drop-shadow-md cursor-pointer" onClick={() => toggleSelection(post.id)}>
                                {selectedIds.includes(post.id) ? <CheckSquare className="text-red-600 bg-white" fill="currentColor" size={24} /> : <Square size={24} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded" />}
                            </div>

                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {post.image ? <img src={post.image.startsWith('http') ? post.image : `${process.env.NEXT_PUBLIC_ASSET_URL || ""}${post.image}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><FileText size={40} /></div>}
                                <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#003366] text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                        {post.category || "Uncategorized"}
                                    </span>
                                    {post.access_tier && (
                                        <span className={`px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${post.access_tier === 'premium' ? 'text-amber-600' : post.access_tier === 'free' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                            {post.access_tier === 'auto' ? 'Auto Access' : post.access_tier}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mb-2">
                                    <Calendar size={10} className="mr-2 text-red-600" /> {new Date(post.created_at).toLocaleDateString()}
                                </div>
                                <h3 className="text-lg font-black text-[#003366] leading-tight mb-2 line-clamp-2">{post.title}</h3>
                                <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mb-6">
                                    <User size={10} className="mr-2" /> South Ring Admin
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                    <Link href={`/blog/${post.id}`} target="_blank">
                                        <button className="text-[10px] font-black uppercase tracking-widest text-[#003366] hover:text-red-600 transition-colors flex items-center">
                                            <Eye size={12} className="mr-2" /> View
                                        </button>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/admin/blog/edit/${post.id}`}>
                                            <button className="w-8 h-8 bg-slate-50 text-[#003366] border border-slate-100 rounded-lg flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all shadow-sm">
                                                <Edit2 size={12} />
                                            </button>
                                        </Link>
                                        <button onClick={() => handleDelete(post.id)} className="w-8 h-8 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-6 w-12 text-center">
                                        <button onClick={selectAll} className="text-slate-400 hover:text-[#003366]">
                                            {selectedIds.length === filteredPosts.length && filteredPosts.length > 0 ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                    <th className="px-10 py-6">Article Information</th>
                                    <th className="px-10 py-6">Category</th>
                                    <th className="px-10 py-6">Publication Date</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPosts.map(post => (
                                    <tr key={post.id} className={`transition-colors group text-[#003366] ${selectedIds.includes(post.id) ? 'bg-red-50/20' : 'hover:bg-slate-50/50'}`}>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleSelection(post.id)} className="text-slate-400 hover:text-[#003366]">
                                                {selectedIds.includes(post.id) ? <CheckSquare size={16} className="text-red-600" /> : <Square size={16} />}
                                            </button>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center space-x-6">
                                                <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
                                                    {post.image ? <img src={post.image.startsWith('http') ? post.image : `${process.env.NEXT_PUBLIC_ASSET_URL || ""}${post.image}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><FileText size={16} /></div>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-red-600 transition-colors truncate mb-1">{post.title}</p>
                                                    <div className="flex items-center text-[9px] text-slate-400 font-black uppercase tracking-[0.1em]">
                                                        <User size={10} className="mr-2 text-red-600" /> Admin
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className="px-2 py-1 bg-slate-50 text-[#003366] text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                                    {post.category || "Uncategorized"}
                                                </span>
                                                {post.access_tier && (
                                                    <span className={`px-2 py-1 bg-slate-50 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100 ${post.access_tier === 'premium' ? 'text-amber-600' : post.access_tier === 'free' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        {post.access_tier === 'auto' ? 'Auto' : post.access_tier}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <div className="flex items-center">
                                                <Calendar size={12} className="mr-2 text-red-600" /> {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link href={`/blog/${post.id}`} target="_blank">
                                                    <button className="w-8 h-8 bg-slate-50 text-[#003366] border border-slate-100 rounded-lg flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all">
                                                        <Eye size={12} />
                                                    </button>
                                                </Link>
                                                <Link href={`/admin/blog/edit/${post.id}`}>
                                                    <button className="w-8 h-8 bg-slate-50 text-[#003366] border border-slate-100 rounded-lg flex items-center justify-center hover:bg-[#003366] hover:text-white transition-all">
                                                        <Edit2 size={12} />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="w-8 h-8 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
