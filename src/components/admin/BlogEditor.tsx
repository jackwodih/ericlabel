
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogoUpload } from '@/components/designer/LogoUpload';
import { BlogPost, blogService } from '@/lib/firebase/blog';
import { 
  Save, 
  X, 
  Image as ImageIcon, 
  AlignLeft, 
  Tag, 
  User,
  Globe,
  Eye,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import dynamique de React Quill pour éviter les erreurs SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-900/50 animate-pulse rounded-xl" />
});
import 'react-quill/dist/quill.snow.css';

interface BlogEditorProps {
  initialData?: BlogPost;
  isEditing?: boolean;
}

export function BlogEditor({ initialData, isEditing = false }: BlogEditorProps) {
  const router = useRouter();
  const quillRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImage: initialData?.coverImage || '',
    author: initialData?.author || 'Label Eric Admin',
    category: initialData?.category || 'Conseils',
    tags: initialData?.tags || [],
    published: initialData?.published || false,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    seoKeywords: initialData?.seoKeywords || '',
  });

  // Modules Quill personnalisés
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean'],
    ],
  }), []);

  // Génération auto du slug
  useEffect(() => {
    if (!isEditing && post.title) {
      const slug = post.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setPost(prev => ({ ...prev, slug }));
    }
  }, [post.title, isEditing]);

  // Upload d'image locale pour le corps de l'article
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'labeleric');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dyrnvzbqr/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        // Insertion de l'image directement dans l'éditeur visuel
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        quill.insertEmbed(range?.index || 0, 'image', data.secure_url);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && initialData?.id) {
        await blogService.updatePost(initialData.id, post);
      } else {
        await blogService.createPost(post);
      }
      router.push('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Styles Quill personnalisés pour correspondre au thème sombre */}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          background: #0f172a !important;
          border-color: rgba(255,255,255,0.1) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        .ql-container.ql-snow {
          border-color: rgba(255,255,255,0.1) !important;
          border-radius: 0 0 12px 12px !important;
          background: rgba(255,255,255,0.02) !important;
          min-height: 400px;
          font-family: inherit;
          font-size: 16px;
        }
        .ql-editor {
          color: #cbd5e1 !important;
          min-height: 400px;
        }
        .ql-editor.ql-blank::before {
          color: #475569 !important;
        }
        .ql-snow .ql-stroke {
          stroke: #94a3b8 !important;
        }
        .ql-snow .ql-fill {
          fill: #94a3b8 !important;
        }
        .ql-snow .ql-picker {
          color: #94a3b8 !important;
        }
      `}</style>

      <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 sticky top-24 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/admin/blog')}
            icon={<X className="w-4 h-4" />}
          >
            Annuler
          </Button>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {isEditing ? 'Modification' : 'Nouvel Article'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Publier</span>
             <button
              type="button"
              onClick={() => setPost({ ...post, published: !post.published })}
              className={`w-12 h-6 rounded-full transition-all relative ${post.published ? 'bg-green-500' : 'bg-gray-700'}`}
             >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${post.published ? 'left-7' : 'left-1'}`} />
             </button>
          </div>
          <Button 
            type="button"
            variant="outline"
            className="border-blue-500/20 text-blue-400 hover:bg-blue-500/5"
            onClick={() => {
              if (!post.slug) return alert('Veuillez d\'abord saisir un titre.');
              window.open(`/blog/${post.slug}`, '_blank');
            }}
            icon={<Eye className="w-4 h-4" />}
          >
            Aperçu
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-8 border-white/5 bg-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Titre de l&apos;article</label>
              <input 
                required
                className="w-full bg-transparent border-none text-3xl font-black outline-none placeholder:text-gray-800"
                placeholder="Entrez un titre percutant..."
                value={post.title}
                onChange={e => setPost({ ...post, title: e.target.value })}
              />
              <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                <span>URL: /blog/</span>
                <input 
                  className="bg-transparent border-none outline-none text-blue-500 flex-1"
                  value={post.slug}
                  onChange={e => setPost({ ...post, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Extrait (Aperçu dans la liste)
              </label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-300 outline-none focus:border-orange-500/30 transition-all"
                rows={3}
                placeholder="Un court résumé pour donner envie de lire..."
                value={post.excerpt}
                onChange={e => setPost({ ...post, excerpt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3 h-3" /> Contenu de l&apos;article (Visuel)
                </label>
                <button 
                  type="button"
                  onClick={() => document.getElementById('inline-image-upload')?.click()}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 transition-all"
                >
                  <ImageIcon className="w-3 h-3" /> Insérer une photo locale
                </button>
                <input 
                  id="inline-image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                />
              </div>

              <ReactQuill 
                ref={quillRef}
                theme="snow"
                value={post.content}
                onChange={(content) => setPost({ ...post, content })}
                modules={modules}
                placeholder="Rédigez votre article ici..."
              />
            </div>
          </Card>

          <Card glass className="p-8 border-white/5 bg-white/5 space-y-6">
            <div className="flex items-center gap-2 text-blue-400">
               <Globe className="w-4 h-4" />
               <h3 className="font-bold">Optimisation SEO (Google)</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Titre Google (SEO Title)</label>
                <Input 
                  placeholder={post.title || "Titre tel qu'il apparaîtra sur Google"}
                  className="bg-slate-900/50"
                  value={post.seoTitle}
                  onChange={e => setPost({ ...post, seoTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mots-clés (Keywords)</label>
                <Input 
                  placeholder="étiquette, cuir, conseils, tutoriel"
                  className="bg-slate-900/50"
                  value={post.seoKeywords}
                  onChange={e => setPost({ ...post, seoKeywords: e.target.value })}
                />
                <p className="text-[10px] text-gray-600 italic">Séparez par des virgules.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description Google (Meta Description)</label>
                <textarea 
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl p-4 text-sm text-gray-400 outline-none"
                  rows={3}
                  placeholder="La description qui s'affichera dans les résultats de recherche."
                  value={post.seoDescription}
                  onChange={e => setPost({ ...post, seoDescription: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card glass className="p-6 border-white/5 bg-white/5 space-y-6">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3 h-3" /> Image de couverture
            </label>
            
            <LogoUpload 
              onUpload={(url) => setPost({ ...post, coverImage: url })}
              onRemove={() => setPost({ ...post, coverImage: '' })}
              value={post.coverImage}
            />
            
            {post.coverImage && (
              <div className="relative group">
                <img src={post.coverImage} alt="Cover" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                <button 
                  type="button"
                  onClick={() => setPost({ ...post, coverImage: '' })}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>

          <Card glass className="p-6 border-white/5 bg-white/5 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3 h-3" /> Catégorie
                </label>
                <select 
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none"
                  value={post.category}
                  onChange={e => setPost({ ...post, category: e.target.value })}
                >
                  <option value="Conseils">Conseils & Astuces</option>
                  <option value="Actualités">Actualités</option>
                  <option value="Réalisations">Nos Réalisations</option>
                  <option value="Tutoriels">Tutoriels</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Auteur
                </label>
                <Input 
                  className="bg-slate-900/50"
                  value={post.author}
                  onChange={e => setPost({ ...post, author: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                   <CheckCircle className="w-4 h-4" />
                   <span className="text-xs font-bold">Prêt pour la publication ?</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Une fois publié, cet article sera visible par vos clients et indexable par les moteurs de recherche.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
