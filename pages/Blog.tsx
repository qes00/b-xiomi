import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedBlogPosts, BlogPost } from '../services/blogService';

export const Blog: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await getPublishedBlogPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error loading blog posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div className="w-full bg-white pb-20">
            {/* Header Section */}
            <div className="w-full bg-white py-8 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-serif tracking-widest text-[#0f1c29] uppercase text-center border-y border-[#0f1c29] py-4">
                        Blog
                    </h1>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-[#3c6e96] text-lg font-light">Cargando entradas...</p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <article 
                                key={post.id} 
                                className="bg-white border-2 border-[#0f1c29] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                            >
                                {/* Blog Post Image */}
                                <div className="w-full h-64 bg-stone-200 overflow-hidden">
                                    {post.image_url ? (
                                        <img 
                                            src={post.image_url} 
                                            alt={post.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-stone-300">
                                            <span className="text-stone-500 text-4xl">📝</span>
                                        </div>
                                    )}
                                </div>

                                {/* Blog Post Content */}
                                <div className="p-6 flex flex-col grow">
                                    <div className="mb-4">
                                        <p className="text-xs text-gold-600 font-semibold uppercase tracking-wider mb-2">
                                            {formatDate(post.created_at)} • {post.author}
                                        </p>
                                        <h2 className="text-xl font-serif font-bold text-[#0f1c29] mb-3 tracking-wide">
                                            {post.title}
                                        </h2>
                                        <p className="text-[#3c6e96] font-light leading-relaxed">
                                            {post.excerpt || post.content.substring(0, 150) + '...'}
                                        </p>
                                    </div>

                                    {/* Read More Button */}
                                    <div className="mt-auto pt-4">
                                        <Link
                                            to={`/blog/${post.id}`}
                                            className="inline-flex items-center gap-2 px-6 py-2 border-2 border-[#0f1c29] text-[#0f1c29] font-semibold uppercase text-sm tracking-wider hover:bg-[#0f1c29] hover:text-white transition-all duration-300"
                                        >
                                            Leer Más
                                            <svg 
                                                className="w-4 h-4" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M9 5l7 7-7 7" 
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-[#3c6e96] text-lg font-light">
                            No hay entradas de blog disponibles en este momento.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
