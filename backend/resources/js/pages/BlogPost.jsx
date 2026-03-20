import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { Calendar, User, Clock, ChevronLeft, Facebook, Twitter, Linkedin, Tag } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import JournalProtectedReader from '../components/JournalProtectedReader';
import { Lock, CreditCard, LogIn, ShieldAlert } from 'lucide-react';

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentPosts, setRecentPosts] = useState([]);
    const [restriction, setRestriction] = useState(null); // { type: 'auth' | 'payment', journal_year?: number }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [postRes, recentRes] = await Promise.all([
                    axios.get(`/api/blog/${id}`),
                    axios.get('/api/blog/recent')
                ]);

                if (postRes.data.success) {
                    setPost(postRes.data.post);
                }
                if (recentRes.data.success) {
                    setRecentPosts(recentRes.data.posts);
                }
            } catch (error) {
                console.error('Error fetching post:', error);
                if (error.response?.status === 401) {
                    setRestriction({ type: 'auth' });
                } else if (error.response?.status === 403) {
                    setRestriction({ type: 'payment', journal_year: error.response.data.journal_year });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-40 text-center">
                    <div className="animate-spin inline-block w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 font-bold uppercase tracking-widest">Loading Article...</p>
                </div>
            </Layout>
        );
    }

    if (restriction) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center">
                    <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl max-w-2xl w-full border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 skew-x-12 transform translate-x-1/2 -translate-y-1/2"></div>

                        <div className="bg-red-600/10 text-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            {restriction.type === 'auth' ? <LogIn size={40} /> : <Lock size={40} />}
                        </div>

                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                            {restriction.type === 'auth' ? 'Login Required' : 'Premium Archive'}
                        </h2>

                        <p className="text-slate-400 font-bold mb-10 leading-relaxed">
                            {restriction.type === 'auth'
                                ? 'Our journals are exclusive to members. Please log in or create an account to continue reading.'
                                : `This post is part of the ${restriction.journal_year} Journal. Access this and other premium stories by purchasing the annual collection.`
                            }
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {restriction.type === 'auth' ? (
                                <>
                                    <Link to="/login" className="bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center">
                                        <LogIn size={16} className="mr-2" /> Login
                                    </Link>
                                    <Link to="/register" className="bg-white text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center">
                                        Sign Up
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/journal" className="bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center">
                                        <CreditCard size={16} className="mr-2" /> Purchase Journal
                                    </Link>
                                    <Link to="/blog" className="bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center">
                                        Other Blogs
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Post Header */}
            <div className="relative h-[50vh] bg-gray-900 flex items-end pb-20 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(${post.image?.replace('/img/Garage-Images/', '/images/') || '/images/default-blog.jpg'})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                <div className="container relative z-10 mx-auto px-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link to="/blog" className="inline-flex items-center text-gray-300 hover:text-white mb-6 uppercase tracking-widest text-xs font-bold transition-colors">
                            <ChevronLeft size={16} className="mr-1" /> Back to Blog
                        </Link>
                        <span className="block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase w-fit mb-4">
                            {post.category}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight max-w-4xl">
                            {post.title}
                        </h1>
                        <div className="flex flex-wrap items-center text-gray-300 mt-8 space-x-6">
                            <span className="flex items-center">
                                <Calendar size={18} className="mr-2 text-red-500" />
                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center">
                                <User size={18} className="mr-2 text-red-500" />
                                By Admin
                            </span>
                            <span className="flex items-center">
                                <Clock size={18} className="mr-2 text-red-500" />
                                5 min read
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Content */}
                    <div className="lg:w-2/3">
                        <JournalProtectedReader isProtected={post.created_at && new Date(post.created_at).getFullYear() < new Date().getFullYear()}>
                            <article className="prose prose-lg prose-red max-w-none text-gray-700 leading-relaxed font-medium">
                                {post.content.split('\n\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-6">{paragraph}</p>
                                ))}
                            </article>
                        </JournalProtectedReader>

                        {/* Share Section */}
                        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">Share:</span>
                                <div className="flex space-x-3">
                                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                        <Facebook size={18} />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-400 hover:text-white transition-all shadow-sm">
                                        <Twitter size={18} />
                                    </button>
                                    <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-700 hover:text-white transition-all shadow-sm">
                                        <Linkedin size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Tag size={18} className="text-red-500" />
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">#{post.category}</span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer">#Automotive</span>
                            </div>
                        </div>

                        {/* Author/About Section */}
                        <div className="mt-16 bg-gray-50 p-8 rounded-2xl flex items-center md:items-start gap-6 border border-gray-100 shadow-inner">
                            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-white border-4 border-white shadow-md">
                                <img src="/images/stock-images/Team-1.jpg" alt="Admin" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">South Ring Autos Team</h4>
                                <p className="text-gray-600 italic">
                                    Keeping you on the road with expert advice, industry trends, and maintenance tips from Nairobi's most trusted automotive service center.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 space-y-12">
                            {/* Recent Posts */}
                            <div>
                                <h4 className="text-xl font-bold mb-8 flex items-center relative pl-4">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-full"></div>
                                    Recent Articles
                                </h4>
                                <div className="space-y-8">
                                    {recentPosts.filter(p => p.id !== post.id).slice(0, 3).map(rPost => (
                                        <div key={rPost.id} className="flex gap-4 group">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img
                                                    src={rPost.image?.replace('/img/Garage-Images/', '/images/') || '/images/default-blog.jpg'}
                                                    alt={rPost.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-red-600 transition-all duration-300">
                                                    <Link to={`/blog/${rPost.id}`}>{rPost.title}</Link>
                                                </h5>
                                                <span className="text-xs text-gray-500 mt-2 block font-medium">
                                                    {new Date(rPost.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden group">
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full transform group-hover:scale-150 transition-transform duration-700"></div>
                                <h4 className="text-2xl font-bold mb-4 relative z-10">Need Expert Service?</h4>
                                <p className="text-blue-100 mb-6 relative z-10 text-sm">
                                    Don't wait until it breaks. Schedule a preventative maintenance check today.
                                </p>
                                <Link
                                    to="/booking"
                                    className="bg-red-600 hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-6 rounded-lg text-center transition-all inline-block relative z-10 w-full"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BlogPost;
