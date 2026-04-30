
'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { blogService, BlogPost } from '@/lib/firebase/blog';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  User,
  Tag,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await blogService.getAllPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      await blogService.deletePost(id);
      loadPosts();
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Gestion du <span className="text-orange-500">Blog</span>
            </h1>
            <p className="text-gray-400">Créez et gérez vos articles pour booster votre SEO.</p>
          </div>
          <Link href="/admin/blog/new">
            <Button className="px-8" icon={<Plus className="w-5 h-5" />}>
              Nouvel Article
            </Button>
          </Link>
        </div>

        {/* Stats Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card glass className="p-6 border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                <FileText />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Articles</p>
                <h3 className="text-2xl font-bold">{posts.length}</h3>
              </div>
            </div>
          </Card>
          <Card glass className="p-6 border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 text-green-500">
                <CheckCircle />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Publiés</p>
                <h3 className="text-2xl font-bold">{posts.filter(p => p.published).length}</h3>
              </div>
            </div>
          </Card>
          <Card glass className="p-6 border-white/5 bg-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 text-orange-500">
                <Clock />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Brouillons</p>
                <h3 className="text-2xl font-bold">{posts.filter(p => !p.published).length}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Rechercher un article..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-orange-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Liste des articles */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map((post, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={post.id}
              >
                <Card glass className="p-6 border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {post.coverImage ? (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-slate-900">
                           <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 text-gray-700 flex-shrink-0">
                           <FileText className="w-8 h-8" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            post.published 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          }`}>
                            {post.published ? 'PUBLIÉ' : 'BROUILLON'}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 uppercase tracking-widest">
                            <Tag className="w-3 h-3" /> {post.category}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold group-hover:text-orange-500 transition-colors">{post.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.createdAt?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <Link href={`/admin/blog/edit/${post.id}`} className="flex-1 md:flex-none">
                        <Button variant="outline" size="sm" className="w-full" icon={<Edit className="w-4 h-4" />}>
                          Modifier
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 flex-1 md:flex-none" 
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => handleDelete(post.id!)}
                      >
                        Supprimer
                      </Button>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="outline" size="sm" className="p-2 border-white/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Aucun article trouvé</h3>
              <p className="text-gray-500 mb-6">Commencez à écrire votre premier article pour booster votre visibilité.</p>
              <Link href="/admin/blog/new">
                <Button variant="outline">Créer mon premier article</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
