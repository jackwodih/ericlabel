
'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BlogEditor } from '@/components/admin/BlogEditor';
import { blogService, BlogPost } from '@/lib/firebase/blog';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      blogService.getAllPosts().then(posts => {
        const found = posts.find(p => p.id === id);
        if (found) {
          setPost(found);
        } else {
          router.push('/admin/blog');
        }
        setLoading(false);
      });
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Chargement de l'article...</p>
          </div>
        ) : post ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-12">
              <h1 className="text-4xl font-black tracking-tight mb-2">
                Modifier <span className="text-orange-500">l'Article</span>
              </h1>
              <p className="text-gray-400">Mise à jour de : <span className="text-white italic">{post.title}</span></p>
            </div>

            <BlogEditor initialData={post} isEditing={true} />
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
