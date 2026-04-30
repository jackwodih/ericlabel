
'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { blogService, BlogPost } from '@/lib/firebase/blog';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

export function BlogListingContent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.getPublishedPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-40">
        <p className="text-gray-500">Aucun article publié pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, idx) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Link href={`/blog/${post.slug}`}>
            <Card glass className="h-full border-white/5 bg-white/5 hover:bg-white/10 transition-all group cursor-pointer overflow-hidden flex flex-col">
              <div className="aspect-video w-full overflow-hidden relative">
                {post.coverImage ? (
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center text-gray-800">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {post.createdAt ? (
                      typeof post.createdAt === 'string' 
                        ? new Date(post.createdAt).toLocaleDateString() 
                        : (post.createdAt as { toDate?: () => {toLocaleDateString: () => string} })?.toDate?.()?.toLocaleDateString() || 'Date inconnue'
                    ) : 'Date inconnue'}
                  </span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center text-orange-500 font-bold text-xs uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
                  Lire l&apos;article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
