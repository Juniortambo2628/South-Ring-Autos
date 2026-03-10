"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageHero from "@/components/landing/PageHero";
import { Loader2, ArrowLeft, BookOpen, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";
export default function ReadJournalPage() {
    const params = useParams();
    const router = useRouter();
    const [journal, setJournal] = useState<any>(null);
    const [blogs, setBlogs] = useState<any[]>([]);
    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Journal
                const journalRes = await api.get(`/journals/${params.id}`);
                const journalData = journalRes.data.data || journalRes.data.journal;

                if (!journalData.has_access) {
                    router.push(`/journal/${params.id}`);
                    return;
                }
                setJournal(journalData);

                // 2. Fetch Blogs for that year
                const blogsRes = await api.get(`/blog?year=${journalData.year}`);
                const blogsQueryData = blogsRes.data.posts || [];
                setBlogs(blogsQueryData);

                if (blogsQueryData.length > 0) {
                    // Fetch full details of the first blog to ensure we get its content block based on access rules
                    fetchBlogDetails(blogsQueryData[0].id);
                }

            } catch (err) {
                console.error("Failed to load journal reader data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id, router]);

    const fetchBlogDetails = async (blogId: number) => {
        try {
            const res = await api.get(`/blog/${blogId}`);
            setSelectedBlog(res.data.post);
        } catch (err) {
            console.error("Failed to load full blog post", err);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!journal) return null;

    return (
        <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
                {/* Minimal Header */}
                <div className="bg-[#003366] pt-32 pb-8">
                    <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row justify-between items-end">
                        <div>
                            <Link href={`/journal/${journal.id}`} className="inline-flex items-center text-red-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors">
                                <ArrowLeft size={14} className="mr-2" /> Back to Overview
                            </Link>
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                                {journal.title}
                            </h1>
                            <p className="text-slate-300 font-medium italic mt-2">Volume {journal.year}</p>
                        </div>
                    </div>
                </div>

                <section className="bg-slate-50 min-h-[80vh]">
                    <div className="container mx-auto px-4 max-w-7xl py-8">
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* Sidebar - Table of Contents */}
                            <div className="w-full lg:w-1/3 xl:w-1/4">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-24">
                                    <h3 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-6 flex items-center">
                                        <BookOpen size={16} className="mr-2 text-red-600" />
                                        Table of Contents
                                    </h3>

                                    {blogs.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No articles published for this year.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {blogs.map((b) => (
                                                <li key={b.id}>
                                                    <button
                                                        onClick={() => fetchBlogDetails(b.id)}
                                                        className={`w-full text-left p-4 rounded-2xl transition-all ${selectedBlog?.id === b.id ? 'bg-red-50 border border-red-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                                    >
                                                        <h4 className={`text-sm font-black uppercase tracking-tight line-clamp-2 ${selectedBlog?.id === b.id ? 'text-red-600' : 'text-[#003366]'}`}>
                                                            {b.title}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                            <Clock size={10} className="mr-1" />
                                                            {new Date(b.created_at).toLocaleDateString()}
                                                            <span className="mx-2">•</span>
                                                            {b.category}
                                                        </div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="w-full lg:w-2/3 xl:w-3/4">
                                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12 min-h-[70vh]">
                                    {selectedBlog ? (
                                        <article>
                                            <div className="mb-8">
                                                <span className="bg-[#003366] text-white px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest inline-block mb-4">
                                                    {selectedBlog.category}
                                                </span>
                                                <h2 className="text-3xl md:text-5xl font-black text-[#003366] uppercase tracking-tighter leading-tight mb-6">
                                                    {selectedBlog.title}
                                                </h2>

                                                {selectedBlog.image && (
                                                    <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-12 shadow-lg">
                                                        <img
                                                            src={selectedBlog.image.startsWith('http') ? selectedBlog.image : `${ASSET_URL}${selectedBlog.image}`}
                                                            alt={selectedBlog.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {selectedBlog.has_access === false ? (
                                                // Should theoretically rarely hit here since reader implies purchase, but good safety net
                                                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center flex flex-col items-center">
                                                    <AlertTriangle size={32} className="text-red-500 mb-4" />
                                                    <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter mb-2">Content Restricted</h3>
                                                    <p className="text-red-500/80 font-medium italic">You do not have the required access to read the full contents of this material.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {selectedBlog.excerpt && !selectedBlog.content && (
                                                        <p className="text-xl text-slate-500 font-medium italic leading-relaxed mb-12 border-l-4 border-red-600 pl-6">
                                                            {selectedBlog.excerpt}
                                                        </p>
                                                    )}
                                                    <div className="prose prose-slate lg:prose-lg max-w-none text-[#003366] opacity-90 select-none
                                                        prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[#003366]
                                                        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                                                        prose-p:leading-relaxed prose-p:font-medium prose-p:mb-6
                                                        prose-a:text-red-600 prose-a:font-black prose-a:decoration-red-600/30 prose-a:underline-offset-4
                                                        prose-img:rounded-2xl prose-img:shadow-md
                                                        prose-strong:font-black prose-strong:text-[#003366]"
                                                        dangerouslySetInnerHTML={{ __html: selectedBlog.content || selectedBlog.excerpt || "<p>Article content missing.</p>" }}
                                                    />
                                                </>
                                            )}
                                        </article>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-24">
                                            <BookOpen size={48} className="mb-4 opacity-20" />
                                            <p className="font-black uppercase tracking-widest text-[#003366]">Select an article from the index</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
