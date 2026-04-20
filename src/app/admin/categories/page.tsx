'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { categoryService } from '@/lib/firebase/categories';
import { ProductCategory } from '@/lib/pricing/types';
import { 
  Plus, 
  Settings2, 
  ChevronLeft, 
  Save,
  Trash,
  Loader2,
  AlertCircle,
  Shapes
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initialCategory: Omit<ProductCategory, 'id' | 'createdAt'> = {
    name: '',
    slug: '',
    description: '',
    pricingModel: 'surface',
    previewType: 'rectangle',
    icon: 'Layers',
    active: true,
    order: 0
  };

  const [newCategory, setNewCategory] = useState(initialCategory);

  // Auth Check
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewCategory({
      ...newCategory,
      name,
      slug: generateSlug(name)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    
    setIsSaving(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, newCategory);
      } else {
        await categoryService.add(newCategory);
      }
      setIsAdding(false);
      setEditingId(null);
      setNewCategory(initialCategory);
      loadCategories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingId(category.id);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      pricingModel: category.pricingModel,
      previewType: category.previewType,
      icon: category.icon || 'Layers',
      active: category.active,
      order: category.order
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cette catégorie ?')) {
      await categoryService.delete(id);
      loadCategories();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">
              Gestion des Univers
            </h1>
            <p className="text-gray-400 mt-2">Créez et configurez vos types de produits personnalisables</p>
          </div>
          
          <div className="flex gap-4">
            <Button 
                variant="outline" 
                onClick={() => router.push('/admin/materials')}
                icon={<ChevronLeft className="w-4 h-4" />}
            >
                Catalogue Matières
            </Button>
            {!isAdding && (
                <Button onClick={() => setIsAdding(true)} icon={<Plus className="w-4 h-4" />}>
                Nouvelle Catégorie
                </Button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card glass className="p-8 border-white/10">
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Shapes className="w-5 h-5 text-orange-500" />
                      </div>
                      <h2 className="text-2xl font-bold">
                        {editingId ? 'Modifier l\'univers' : 'Nouvel Univers'}
                      </h2>
                    </div>
                    <Button variant="ghost" type="button" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                      Annuler
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Input 
                        label="Nom de l'univers" 
                        placeholder="ex: Mugs, T-shirts, Enseignes..." 
                        required 
                        value={newCategory.name}
                        onChange={e => handleNameChange(e.target.value)}
                      />
                      
                      <Input 
                        label="Slug (URL)" 
                        placeholder="mug-personnalise" 
                        required 
                        value={newCategory.slug}
                        onChange={e => setNewCategory({...newCategory, slug: e.target.value})}
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Icône (Nom Lucide)</label>
                        <select 
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                            value={newCategory.icon}
                            onChange={e => setNewCategory({...newCategory, icon: e.target.value})}
                        >
                            <option value="Layers">Couches</option>
                            <option value="Circle">Cercle</option>
                            <option value="Square">Carré</option>
                            <option value="LayoutGrid">Grille</option>
                            <option value="Shapes">Formes</option>
                            <option value="Box">Boîte</option>
                            <option value="Tags">Étiquettes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Modèle de Tarification</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          value={newCategory.pricingModel}
                          onChange={e => setNewCategory({...newCategory, pricingModel: e.target.value as 'surface' | 'unit' | 'volume'})}
                        >
                          <option value="surface">Par Surface (cm²) - ex: Étiquettes</option>
                          <option value="unit">Par Unité (Pièce) - ex: Mugs, Stylos</option>
                          <option value="volume">Par Volume (cm³) - ex: Boîtes</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Type de Prévisualisation</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                          value={newCategory.previewType}
                          onChange={e => setNewCategory({...newCategory, previewType: e.target.value as 'rectangle' | 'circle' | 'square' | 'template'})}
                        >
                          <option value="rectangle">Rectangle (Étiquette/Ruban)</option>
                          <option value="circle">Cercle (Bouton)</option>
                          <option value="square">Carré</option>
                          <option value="template">Template par défaut</option>
                        </select>
                      </div>

                      <Input 
                        type="number" 
                        label="Ordre d'affichage" 
                        value={newCategory.order}
                        onChange={e => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <Button 
                      type="submit" 
                      loading={isSaving}
                      icon={<Save className="w-4 h-4" />}
                    >
                      {editingId ? 'Mettre à jour' : 'Créer l\'univers'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                  <p className="text-gray-500 font-medium">Chargement des univers...</p>
                </div>
              ) : categories.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((c) => (
                    <Card key={c.id} glass className="group hover:border-orange-500/30 transition-all duration-500 overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                            <Shapes className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(c)}
                              className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                              <Settings2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(c.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                        <p className="text-xs text-orange-500 font-mono mb-4">/{c.slug}</p>
                        
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Mode de prix:</span>
                                <span className="text-white uppercase font-bold">{c.pricingModel}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Visuel:</span>
                                <span className="text-white uppercase font-bold">{c.previewType}</span>
                            </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Aucun univers créé</h2>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Commencez par créer une catégorie (ex: Étiquettes) pour pouvoir y ajouter des matières.
                  </p>
                  <Button size="lg" onClick={() => setIsAdding(true)} icon={<Plus />}>Créer le premier univers</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
