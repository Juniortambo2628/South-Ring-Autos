import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ChevronRight, Search, Clock, Tag } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['All', 'General', 'Maintenance', 'Tips', 'News']);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
        fetchRecentPosts();
    }, [activeCategory]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeCategory !== 'All') params.category = activeCategory;
            if (searchQuery) params.search = searchQuery;

            const response = await axios.get('/api/blog', { params });
            if (response.data.success) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentPosts = async () => {
        try {
            const response = await axios.get('/api/blog/recent');
            if (response.data.success) {
                setRecentPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error fetching recent posts:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPosts();
    };

    return (
        <Layout>
            {/* Page Header */}
            <div className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: "url('/images/Car-Maintenance-1.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold mb-4"
                    >
                        Blog & News
                    </motion.h1>
                    <nav className="flex justify-center text-sm font-medium uppercase tracking-wider text-gray-300">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-red-500">Blog</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 4, 5].map(i => (
                                    <div key={i} className="bg-gray-100 h-96 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {posts.length > 0 ? (
                                        posts.map((post) => (
                                            <motion.article
                                                key={post.id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
                                            >
                                                <div className="relative h-56 overflow-hidden">
                                                    <img
                                                        src={post.image?.replace('/img/Garage-Images/', '/images/') || '/images/default-blog.jpg'}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                                                        <span className="flex items-center">
                                                            <Calendar size={14} className="mr-1 text-red-500" />
                                                            {new Date(post.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <User size={14} className="mr-1 text-red-500" />
                                                            Admin
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                                                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                                                    </h3>
                                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                                        {post.excerpt || post.content.substring(0, 150) + '...'}
                                                    </p>
                                                    <Link
                                                        to={`/blog/${post.id}`}
                                                        className="inline-flex items-center text-sm font-bold text-blue-900 uppercase tracking-wider group-hover:text-red-600 transition-colors"
                                                    >
                                                        Read More <ChevronRight size={16} className="ml-1" />
                                                    </Link>
                                                </div>
                                            </motion.article>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full text-gray-400 mb-4">
                                                <Search size={40} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">No posts found</h3>
                                            <p className="text-gray-600 mt-2">Try adjusting your filters or search query.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 space-y-10">
                            {/* Search */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-lg font-bold mb-4 flex items-center">
                                    <Search size={20} className="mr-2 text-red-600" /> Search
                                </h4>
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search articles..."
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 h-8 w-8 bg-red-600 text-white rounded-md flex items-center justify-center hover:bg-red-700 transition-colors"
                                    >
                                        <Search size={16} />
                                    </button>
                                </form>
                            </div>

                            {/* Categories */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-lg font-bold mb-4 flex items-center">
                                    <Tag size={20} className="mr-2 text-red-600" /> Categories
                                </h4>
                                <div className="space-y-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeCategory === cat
                                                ? 'bg-red-600 text-white font-bold shadow-md'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>{cat}</span>
                                            <ChevronRight size={16} className={activeCategory === cat ? 'opacity-100' : 'opacity-40'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Posts */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-lg font-bold mb-6 flex items-center">
                                    <Clock size={20} className="mr-2 text-red-600" /> Recent Posts
                                </h4>
                                <div className="space-y-6">
                                    {recentPosts.map(post => (
                                        <div key={post.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={post.image || '/images/default-blog.jpg'}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                                                </h5>
                                                <span className="text-xs text-gray-500 flex items-center mt-2">
                                                    <Calendar size={12} className="mr-1" />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Blog;
