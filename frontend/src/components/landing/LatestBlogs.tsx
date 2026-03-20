"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowRight, Calendar, User } from "lucide-react";

export default function LatestBlogs({ content }: { content?: any }) {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        api.get('/blog').then(res => {
            // Get top 3
            if (res.data.data) {
                setBlogs(res.data.data.slice(0, 3));
            }
        }).catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading || blogs.length === 0) return null;

    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
                    <div className="max-w-2xl mb-6 md:mb-0">
                        <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-2 block">Latest News</span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">From The Blog</h2>
                    </div>
                    <Link href="/blog" className="group flex items-center space-x-2 text-[#003366] hover:text-red-600 font-black text-sm uppercase tracking-widest transition-colors">
                        <span>View All Posts</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {blogs.map((post) => (
                        <Link href={`/blog/${post.id}`} key={post.id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                            <div className="relative h-56 overflow-hidden bg-slate-100">
                                <img
                                    src={post.image_url ? (post.image_url.startsWith('http') ? post.image_url : `${ASSET_URL}/${post.image_url}`) : `${ASSET_URL}/images/South-ring-logos/SR-Logo-Transparent-BG.png`}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-xs font-black uppercase tracking-widest rounded-lg shadow-lg">
                                    {post.category || "News"}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                                    <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <User size={14} className="mr-2 text-red-600" />
                                        {post.author?.name || "South Ring Admin"}
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-slate-400">
                                        <Calendar size={14} className="mr-2" />
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
