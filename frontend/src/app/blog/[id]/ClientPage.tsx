"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";
export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const [subEmail, setSubEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/blog/${id}`);
                setPost(res.data.post || res.data.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError("Post not found");
                } else if (err.response?.status === 403) {
                    setError(err.response?.data?.message || "Access denied");
                } else if (err.response?.status === 401) {
                    setError(err.response?.data?.message || "Please login to view this post");
                } else {
                    setError("An error occurred while fetching the post.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subEmail) return;

        setSubmitting(true);
        try {
            await api.post('/subscribe', { email: subEmail });
            toast({
                title: "Subscribed Successfully!",
                description: "You've been added to our newsletter."
            });
            setSubEmail("");
        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Subscription Failed",
                description: err.response?.data?.message || "Failed to subscribe."
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex items-center justify-center bg-slate-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 py-32 text-center px-4">
                    {error === "Post not found" ? (
                        <>
                            <h1 className="text-6xl font-black text-[#003366] mb-6">404</h1>
                            <p className="text-xl text-slate-500 mb-8 font-medium italic">The article you're looking for doesn't exist.</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-black text-[#003366] mb-6">Access Restricted</h1>
                            <p className="text-xl text-red-600 mb-8 font-medium italic">{error}</p>
                        </>
                    )}
                    <Link href="/blog" className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[9px] hover:-translate-y-1 transition-transform">
                        Back to the Blog
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-gray-800 antialiased">
            <Navbar />

            <main className="flex-grow">
                {/* Hero / Header */}
                <div className="relative pt-32 pb-20 bg-[#003366] overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#002244] -rotate-12 rounded-3xl opacity-50" />
                        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[100%] bg-red-600/10 rotate-12 rounded-3xl blur-3xl mix-blend-screen" />

                        <div className="absolute inset-0 z-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
                        />
                    </div>

                    <div className="container mx-auto px-4 relative z-10 max-w-4xl pt-12">
                        <Link href="/blog" className="inline-flex items-center text-red-500 font-black text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-white transition-colors group">
                            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Blog
                        </Link>

                        <div className="mb-6">
                            <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg inline-block">
                                {post.category || 'Maintenance'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight uppercase">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            <div className="flex items-center">
                                <Calendar size={14} className="mr-2 text-red-500" />
                                {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.date}
                            </div>
                            <div className="flex items-center">
                                <User size={14} className="mr-2 text-red-500" />
                                {post.author || 'South Ring Specialist'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Article Body */}
                <article className="py-16 bg-white relative -mt-10 rounded-t-[40px] z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)] border-t border-slate-100/50 max-w-5xl mx-auto">
                    <div className="container mx-auto px-6 max-w-3xl">

                        <div className={`w-full h-[400px] mb-12 rounded-3xl overflow-hidden shadow-xl shadow-slate-200 ${!post.image ? 'border-b border-slate-100 bg-slate-50 flex items-center justify-center p-4' : ''}`} style={{ marginTop: "-80px" }}>
                            <img
                                src={post.image ? (post.image.startsWith('http') ? post.image : `${ASSET}${post.image}`) : "/images/South-ring-logos/SR-Logo-Transparent-BG.png"}
                                alt={post.title}
                                className={`w-full h-full ${!post.image ? 'object-contain opacity-50 max-h-64' : 'object-cover'}`}
                            />
                        </div>

                        {post.excerpt && !post.content && (
                            <p className="text-xl text-slate-500 font-medium italic leading-relaxed mb-12 border-l-4 border-red-600 pl-6">
                                {post.excerpt}
                            </p>
                        )}

                        {post.has_access === false ? (
                            <div className="relative mt-8">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 h-64 pointer-events-none" />
                                <div className="prose prose-slate prose-lg max-w-none text-[#003366] opacity-30 select-none blur-[2px]"
                                    dangerouslySetInnerHTML={{ __html: "<p>This is a preview of the premium content. The full article contains in-depth analysis, comprehensive guidelines, and expert automotive insights that are exclusive to our annual journal subscribers...</p><p>Unlock the secrets of efficient vehicle maintenance and discover advanced techniques that professionals use to ensure longevity and performance.</p>" }}
                                />
                                <div className="relative z-20 mt-8 bg-[#003366] rounded-3xl p-8 md:p-12 text-center shadow-2xl overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Premium Archive Content</h3>
                                    <p className="text-slate-300 font-medium italic mb-8 max-w-xl mx-auto">
                                        This article is part of our {new Date(post.created_at || post.date).getFullYear()} Journal Collection. Purchase access to the full journal to read this and dozens of other expert insights.
                                    </p>
                                    <Link
                                        href={post.journal_id ? `/journal/${post.journal_id}` : `/journal`}
                                        className="inline-block bg-red-600 hover:bg-red-700 text-white font-black px-12 py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1"
                                    >
                                        Unlock Full Journal
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-slate prose-lg max-w-none text-[#003366] opacity-90 select-none
                                prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[#003366]
                                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                                prose-p:leading-relaxed prose-p:font-medium prose-p:mb-6
                                prose-a:text-red-600 prose-a:font-black prose-a:decoration-red-600/30 prose-a:underline-offset-4
                                prose-img:rounded-3xl prose-img:shadow-xl
                                prose-strong:font-black prose-strong:text-[#003366]"
                                dangerouslySetInnerHTML={{ __html: post.content || post.excerpt || "<p>Article content coming soon.</p>" }}
                            />
                        )}

                        {/* Tags Section */}
                        {post.tags && (
                            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                                <Tag size={16} className="text-slate-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Related Tags:</span>
                                {typeof post.tags === 'string' ? post.tags.split(',').map((tag: string, i: number) => (
                                    <span key={i} className="px-4 py-1.5 bg-slate-50 text-[#003366] rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                        {tag.trim()}
                                    </span>
                                )) : null}
                            </div>
                        )}
                    </div>
                </article>

                {/* Newsletter CTA */}
                <section className="py-24 bg-slate-900 overflow-hidden relative mt-16">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -mr-48 -mt-48" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter">Stay updated with car care tips</h2>
                            <p className="text-slate-400 font-medium mb-12 max-w-2xl mx-auto italic">
                                Subscribe to our newsletter and get the latest maintenance advice, seasonal offers, and automotive news delivered to your inbox.
                            </p>
                            <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                                <input
                                    type="email"
                                    value={subEmail}
                                    onChange={(e) => setSubEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                    className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-4 focus:ring-red-600/20 focus:border-red-600 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black px-10 py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center shrink-0"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
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
