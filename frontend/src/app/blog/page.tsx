"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { motion } from "framer-motion";
import { Calendar, User, ChevronRight, Search, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";

// Remove static posts
const categories = ["All", "Maintenance", "Tips & Tricks", "Technology", "News", "Safety"];

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const url = activeCategory === "All" ? "/blog" : `/blog?category=${encodeURIComponent(activeCategory)}`;
                const res = await api.get(url);
                setPosts(res.data.posts || []);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [activeCategory]);

    const filteredPosts = posts.filter(post => {
        const matchesCat = activeCategory === "All" || post.category === activeCategory;
        const matchesSearch = search.trim() === "" ||
            (post.title?.toLowerCase().includes(search.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(search.toLowerCase()));
        return matchesCat && matchesSearch;
    });

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                <PageHero
                    title="The South Ring Blog"
                    subtitle="Expert automotive advice, maintenance tips, and the latest news from your neighborhood car clinic."
                    breadcrumb={[{ label: "BLOG", href: "/blog" }]}
                />

                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4">
                        {/* Filters & Search */}
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat
                                            ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full lg:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={18} />
                                <Input
                                    className="pl-12 py-6 rounded-2xl bg-slate-50 border-slate-200 focus:ring-4 focus:ring-red-600/10 focus:border-red-600"
                                    placeholder="Search articles..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Blog Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {loading ? (
                                [1, 2, 3].map(skeleton => (
                                    <div key={skeleton} className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 h-[400px] animate-pulse">
                                        <div className="h-64 bg-slate-100" />
                                        <div className="p-8">
                                            <div className="h-4 bg-slate-100 rounded w-1/4 mb-4" />
                                            <div className="h-6 bg-slate-100 rounded w-3/4 mb-4" />
                                            <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                                            <div className="h-4 bg-slate-100 rounded w-5/6" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredPosts.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-slate-500 font-medium">No articles found matching your criteria.</p>
                                </div>
                            ) : filteredPosts.map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 group hover:-translate-y-2 transition-transform h-full"
                                >
                                    <div className="h-64 overflow-hidden relative border-b border-slate-100 bg-slate-50 flex items-center justify-center p-4">
                                        <img
                                            src={post.image ? `${ASSET}${post.image}` : "/images/South-ring-logos/SR-Logo-Transparent-BG.png"}
                                            alt={post.title}
                                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${!post.image ? 'object-contain opacity-50 max-h-48' : ''}`}
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center space-x-6 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center"><Calendar size={14} className="mr-2 text-red-600" /> {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Recent'}</div>
                                            <div className="flex items-center"><User size={14} className="mr-2 text-red-600" /> {post.author || 'South Ring Team'}</div>
                                        </div>
                                        <h3 className="text-xl font-black text-[#003366] mb-4 leading-tight uppercase group-hover:text-red-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <Link href={`/blog/${post.id}`} className="inline-flex items-center text-red-600 font-black text-[10px] uppercase tracking-[0.2em] group/link underline decoration-red-600/20 underline-offset-8 decoration-2 hover:decoration-red-600 transition-all">
                                            Read Full Article <ArrowRight size={14} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {/* Pagination placeholder */}
                        <div className="mt-20 flex justify-center space-x-2">
                            {[1, 2, 3].map(p => (
                                <button key={p} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${p === 1 ? "bg-[#003366] text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                                    {p}
                                </button>
                            ))}
                            <button className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-24 bg-slate-900 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Stay updated with car care tips</h2>
                            <p className="text-slate-400 font-medium mb-12 max-w-2xl mx-auto italic">
                                Subscribe to our newsletter and get the latest maintenance advice, seasonal offers, and automotive news delivered to your inbox.
                            </p>
                            <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                                <input type="email" placeholder="Enter your email address" className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-4 focus:ring-red-600/20 focus:border-red-600 transition-all" />
                                <button className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1">
                                    Subscribe Now
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
