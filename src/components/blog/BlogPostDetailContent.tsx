
'use client';

import React from 'react';
import { BlogPost } from '@/lib/firebase/blog';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface BlogPostDetailContentProps {
  post: BlogPost;
}

export function BlogPostDetailContent({ post }: BlogPostDetailContentProps) {
  return (
    <>
      {!post.published && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-orange-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/50 flex items-center gap-2 animate-pulse">
          <Eye className="w-4 h-4" /> Mode Aperçu (Brouillon)
        </div>
      )}
      
      {/* Header avec Image */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        {post.coverImage ? (
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href="/blog">
                <Button variant="outline" size="sm" className="mb-8 border-white/10 bg-white/5 backdrop-blur-md" icon={<ArrowLeft className="w-4 h-4" />}>
                  Retour au blog
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {post.category}
                </span>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-300 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {post.createdAt && (typeof post.createdAt === 'string' ? new Date(post.createdAt).toLocaleDateString() : post.createdAt?.toDate?.()?.toLocaleDateString())}
                  </span>
                  <span className="flex items-center gap-1 md:flex hidden"><User className="w-3 h-3" /> {post.author}</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-8">
                {post.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenu de l'article */}
      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
             <div className="prose prose-invert prose-orange max-w-none">
                <div 
                  className="text-gray-300 text-lg leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
             </div>
             
             <div className="mt-20 pt-12 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  {post.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-500 font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button variant="outline" size="sm" icon={<Share2 className="w-4 h-4" />}>
                  Partager l'article
                </Button>
             </div>
          </div>

          {/* Sidebar latérale */}
          <aside className="lg:col-span-1 space-y-8 md:block hidden">
            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
              <h3 className="font-bold mb-4">À propos de l'auteur</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-black">
                  {post.author.charAt(0)}
                </div>
                <div className="text-sm font-bold">{post.author}</div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Expert en solutions de marquage et étiquetage pour les marques premium en Afrique.
              </p>
            </div>

            <div className="p-6 bg-orange-600 rounded-2xl text-white">
              <h3 className="font-black text-xl mb-4 leading-tight">Besoin d'étiquettes personnalisées ?</h3>
              <p className="text-sm opacity-90 mb-6 leading-relaxed">
                Créez vos propres designs en quelques clics avec notre outil en ligne.
              </p>
              <Link href="/designer">
                <Button variant="outline" className="w-full bg-white text-orange-600 border-none hover:bg-white/90">
                  Lancer le Designer
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
