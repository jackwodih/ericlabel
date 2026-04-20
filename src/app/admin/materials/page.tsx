'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoUpload } from '@/components/designer/LogoUpload';
import { materialService, Material } from '@/lib/firebase/materials';
import { categoryService } from '@/lib/firebase/categories';
import { ProductCategory } from '@/lib/pricing/types';
import { 
  Plus, 
  Settings2, 
  Palette, 
  ChevronLeft, 
  Sparkles,
  Eye, 
  AlertCircle,
  Loader2,
  Trash,
  Save,
  Shapes,
  Square,
  Circle,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function AdminMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  
  const initialMaterial: Material = {
    name: '',
    description: '',
    productType: 'label',
    pricingModel: 'surface',
    basePrice: 500,
    pricePerSqCm: 50,
    pricePerUnit: 0,
    pricePerCm3: 0,
    color1: '#f97316',
    color2: '#9a3412',
    techniques: ['print'],
    active: true,
    textureUrl: '',
    shape: 'rectangle',
    defaultWidth: 6,
    defaultHeight: 2
  };

  const [newMaterial, setNewMaterial] = useState<Material>(initialMaterial);

  // Fix for Cloudinary scroll bug
  useEffect(() => {
    const fixScroll = () => {
      document.body.style.overflow = 'auto';
    };
    window.addEventListener('focus', fixScroll);
    return () => window.removeEventListener('focus', fixScroll);
  }, []);

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
    loadMaterials();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await categoryService.getAll();
    setCategories(data);
  };

  const loadMaterials = async () => {
    try {
      const data = await materialService.getAll();
      setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.name) return;
    
    setIsSaving(true);
    try {
      if (editingId) {
        await materialService.update(editingId, newMaterial);
      } else {
        await materialService.add(newMaterial);
      }
      setIsAdding(false);
      setEditingId(null);
      loadMaterials();
      setNewMaterial(initialMaterial);
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (m: Material) => {
    setNewMaterial(m);
    setEditingId(m.id!);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce matériau ?')) return;
    try {
      await materialService.delete(id);
      loadMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Settings2 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Administration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              Catalogue <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Matières</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button 
                variant="outline" 
                size="lg"
                onClick={() => router.push('/admin/categories')}
                icon={<Shapes className="w-5 h-5" />}
            >
                Gérer les Univers
            </Button>
            <Button 
                size="lg"
                className="shadow-xl shadow-orange-600/10"
                icon={isAdding ? <ChevronLeft /> : <Plus />} 
                onClick={() => {
                if (isAdding) {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewMaterial(initialMaterial);
                } else {
                    setIsAdding(true);
                }
                }}
            >
                {isAdding ? 'Retour à la liste' : 'Nouveau Matériau'}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div 
              key="add-form"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-12 gap-8"
            >
              {/* Form Section */}
              <div className="lg:col-span-8">
                <Card glass className="border-white/5 p-8">
                  <form onSubmit={handleSave} className="space-y-10">
                    {/* Basic Info */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 text-xl font-bold border-b border-white/5 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Settings2 className="w-4 h-4" />
                        </div>
                        Configuration du Produit
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Input 
                            label="Nom du matériau" 
                            placeholder="ex: Velours Royal, Cuir Premium..." 
                            required 
                            value={newMaterial.name}
                            onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Input 
                            label="Description" 
                            placeholder="Décrivez l'aspect et le toucher..." 
                            value={newMaterial.description}
                            onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 md:col-span-2">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">Univers du Produit</label>
                            <select 
                               className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 appearance-none pointer-events-auto"
                               style={{ colorScheme: 'dark' }}
                               value={newMaterial.categoryId}
                               onChange={e => {
                                 const cat = categories.find(c => c.id === e.target.value);
                                 setNewMaterial({
                                   ...newMaterial, 
                                   categoryId: e.target.value,
                                   productType: cat?.slug || 'generic',
                                   pricingModel: cat?.pricingModel || 'surface'
                                 });
                               }}
                             >
                               <option value="" className="bg-slate-900 text-white">Sélectionner un univers...</option>
                               {categories.map(cat => (
                                 <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.name}</option>
                               ))}
                             </select>
                            {categories.length === 0 && (
                                <p className="text-[10px] text-orange-400 italic">Aucun univers trouvé. Créez-en un d&apos;abord.</p>
                            )}
                          </div>
                          <div className="space-y-2 opacity-50">
                            <label className="block text-sm font-medium text-gray-400">Modèle de Tarification (Auto)</label>
                            <Input 
                                value={newMaterial.pricingModel.toUpperCase()}
                                disabled
                            />
                          </div>
                        </div>

                        {/* Shape Selection */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                          <label className="block text-sm font-medium text-gray-400">Forme finale du produit</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" /> },
                              { id: 'rounded', label: 'Arrondi', icon: <div className="w-5 h-5 border-2 border-current rounded-sm" /> },
                              { id: 'circle', label: 'Cercle', icon: <Circle className="w-5 h-5" /> },
                              { id: 'square', label: 'Carré', icon: <div className="w-5 h-5 border-2 border-current" /> },
                              { id: 'oval', label: 'Ovale', icon: <div className="w-6 h-4 border-2 border-current rounded-full" /> }
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setNewMaterial({...newMaterial, shape: s.id as 'rectangle' | 'rounded' | 'circle' | 'square' | 'oval'})}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                  newMaterial.shape === s.id 
                                    ? 'border-orange-500 bg-orange-500/10 text-orange-500' 
                                    : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/10'
                                }`}
                              >
                                {s.icon}
                                <span className="text-xs font-bold">{s.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Input 
                          type="number" 
                          label="Frais Techniques / Base (FCFA)" 
                          icon={<span className="text-xs font-bold">F</span>}
                          value={newMaterial.basePrice}
                          onChange={e => setNewMaterial({...newMaterial, basePrice: Number(e.target.value)})}
                        />

                        {newMaterial.pricingModel === 'surface' && (
                          <Input 
                            type="number" 
                            label="Prix par cm² (FCFA)" 
                            icon={<span className="text-xs font-bold">cm²</span>}
                            value={newMaterial.pricePerSqCm}
                            onChange={e => setNewMaterial({...newMaterial, pricePerSqCm: Number(e.target.value)})}
                          />
                        )}
                        
                        {newMaterial.pricingModel === 'unit' && (
                          <Input 
                            type="number" 
                            label="Prix par Unité (FCFA)" 
                            icon={<span className="text-xs font-bold">Pcs</span>}
                            value={newMaterial.pricePerUnit}
                            onChange={e => setNewMaterial({...newMaterial, pricePerUnit: Number(e.target.value)})}
                          />
                        )}

                        {newMaterial.pricingModel === 'volume' && (
                          <Input 
                            type="number" 
                            label="Prix par cm³ (FCFA)" 
                            icon={<span className="text-xs font-bold">cm³</span>}
                            value={newMaterial.pricePerCm3}
                            onChange={e => setNewMaterial({...newMaterial, pricePerCm3: Number(e.target.value)})}
                          />
                        )}
                      </div>
                    </section>

                    {/* Visual Aspect */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 text-xl font-bold border-b border-white/5 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Palette className="w-4 h-4" />
                        </div>
                        Identité Visuelle
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-400">Dégradé de couleur principal</label>
                          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10">
                            <div className="flex-1 space-y-1">
                               <p className="text-[10px] text-gray-500 uppercase font-bold">Couleur Haut (Matière)</p>
                               <input 
                                type="color" 
                                className="w-full h-12 rounded-lg bg-transparent cursor-pointer border-none"
                                value={newMaterial.color1}
                                onChange={e => setNewMaterial({...newMaterial, color1: e.target.value})}
                               />
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="flex-1 space-y-1">
                               <p className="text-[10px] text-gray-500 uppercase font-bold">Couleur Bas (Fond)</p>
                               <input 
                                type="color" 
                                className="w-full h-12 rounded-lg bg-transparent cursor-pointer border-none"
                                value={newMaterial.color2}
                                onChange={e => setNewMaterial({...newMaterial, color2: e.target.value})}
                               />
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-400">Texture du grain (Upload)</label>
                          <LogoUpload 
                            label="Uploader une Texture"
                            description="Image N&B de la matière (cuir, fibre, velours)"
                            onUpload={(url) => setNewMaterial({...newMaterial, textureUrl: url})}
                            onRemove={() => setNewMaterial({...newMaterial, textureUrl: ''})}
                            value={newMaterial.textureUrl}
                          />
                        </div>

                        {/* Default Dimensions */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
                          <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-400">
                               {(newMaterial.shape === 'circle' || newMaterial.shape === 'square') ? 'Côté / Diamètre (cm)' : 'Largeur standard (cm)'}
                             </label>
                             <input 
                                type="number"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                                value={newMaterial.defaultWidth || ''}
                                onChange={e => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  setNewMaterial({
                                    ...newMaterial, 
                                    defaultWidth: val,
                                    defaultHeight: (newMaterial.shape === 'circle' || newMaterial.shape === 'square') ? val : newMaterial.defaultHeight
                                  });
                                }}
                             />
                          </div>
                          {!(newMaterial.shape === 'circle' || newMaterial.shape === 'square') && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-400">Hauteur standard (cm)</label>
                              <input 
                                 type="number"
                                 className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-orange-500 transition-colors"
                                 value={newMaterial.defaultHeight || ''}
                                 onChange={e => setNewMaterial({...newMaterial, defaultHeight: e.target.value === '' ? 0 : Number(e.target.value)})}
                              />
                            </div>
                          )}
                          <p className="md:col-span-2 text-[10px] text-gray-500 italic">
                            Ces dimensions seront utilisées par défaut dans le designer pour ce matériau.
                          </p>
                        </div>
                      </div>
                    </section>
                    
                    {/* Variants Section */}
                    <section className="space-y-6 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xl font-bold">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <Layers className="w-4 h-4" />
                          </div>
                          Variantes du produit
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newVariant = {
                              id: Math.random().toString(36).substr(2, 9),
                              name: '',
                              color: '#ffffff'
                            };
                            setNewMaterial({
                              ...newMaterial,
                              variants: [...(newMaterial.variants || []), newVariant]
                            });
                          }}
                          icon={<Plus className="w-4 h-4" />}
                        >
                          Ajouter une variante
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {(!newMaterial.variants || newMaterial.variants.length === 0) ? (
                          <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                            <p className="text-gray-500 text-sm">Aucune variante définie. Le produit utilisera ses paramètres par défaut.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                                  <th className="pb-4">Nom de la variante</th>
                                  <th className="pb-4">Couleur / Texture</th>
                                  <th className="pb-4">Prix Total (FCFA)</th>
                                  <th className="pb-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {newMaterial.variants.map((v, idx) => (
                                  <tr key={v.id} className="group transition-colors">
                                    <td className="py-4 pr-4 space-y-2">
                                      <input 
                                        className="w-full bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        placeholder="Nom de la variante"
                                        value={v.name}
                                        onChange={e => {
                                          const updated = [...(newMaterial.variants || [])];
                                          updated[idx].name = e.target.value;
                                          setNewMaterial({...newMaterial, variants: updated});
                                        }}
                                      />
                                      <textarea 
                                        className="w-full bg-slate-900 border border-white/5 rounded px-3 py-1 text-[10px] outline-none focus:border-orange-500/50 text-gray-400 min-h-[40px] resize-none"
                                        placeholder="Description optionnelle..."
                                        value={v.description}
                                        onChange={e => {
                                          const updated = [...(newMaterial.variants || [])];
                                          updated[idx].description = e.target.value;
                                          setNewMaterial({...newMaterial, variants: updated});
                                        }}
                                      />
                                    </td>
                                    <td className="py-4 pr-4">
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="color"
                                          className="w-8 h-8 rounded bg-transparent cursor-pointer border-none"
                                          value={v.color}
                                          onChange={e => {
                                            const updated = [...(newMaterial.variants || [])];
                                            updated[idx].color = e.target.value;
                                            setNewMaterial({...newMaterial, variants: updated});
                                          }}
                                        />
                                        <LogoUpload 
                                          onUpload={(url) => {
                                            const updated = [...(newMaterial.variants || [])];
                                            updated[idx].textureUrl = url;
                                            setNewMaterial({...newMaterial, variants: updated});
                                          }}
                                          onRemove={() => {
                                            const updated = [...(newMaterial.variants || [])];
                                            updated[idx].textureUrl = '';
                                            setNewMaterial({...newMaterial, variants: updated});
                                          }}
                                          value={v.textureUrl}
                                        />
                                      </div>
                                    </td>
                                    <td className="py-4 pr-4">
                                      <input 
                                        type="number"
                                        className="w-32 bg-slate-900 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-orange-500"
                                        value={
                                          (newMaterial.pricingModel === 'surface' ? v.pricePerSqCm :
                                          newMaterial.pricingModel === 'unit' ? v.pricePerUnit :
                                          v.pricePerCm3) || ''
                                        }
                                        onChange={e => {
                                          const val = e.target.value === '' ? 0 : Number(e.target.value);
                                          const updated = [...(newMaterial.variants || [])];
                                          if (newMaterial.pricingModel === 'surface') updated[idx].pricePerSqCm = val;
                                          else if (newMaterial.pricingModel === 'unit') updated[idx].pricePerUnit = val;
                                          else updated[idx].pricePerCm3 = val;
                                          setNewMaterial({...newMaterial, variants: updated});
                                        }}
                                      />
                                    </td>
                                    <td className="py-4 text-right">
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          const updated = newMaterial.variants?.filter((_, i) => i !== idx);
                                          setNewMaterial({...newMaterial, variants: updated});
                                        }}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                      >
                                        <Trash className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </section>

                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        Toutes les modifications sont effectives immédiatement côté client.
                      </div>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="lg" 
                        className="w-full sm:w-auto px-10 py-4 shadow-orange-600/20"
                        loading={isSaving}
                        icon={<Save className="w-5 h-5" />}
                      >
                        {editingId ? 'Mettre à jour le matériel' : 'Enregistrer le matériel'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Preview Sticky Column */}
              <div className="lg:col-span-4">
                <div className="sticky top-32 space-y-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest pl-2">
                    <Eye className="w-4 h-4" /> Aperçu en temps réel
                  </div>
                  
                  <Card glass className="p-0 overflow-hidden border-white/10 group shadow-2xl relative">
                    <div 
                      className="aspect-square w-full flex items-center justify-center p-8 transition-all duration-700"
                      style={{ 
                        backgroundColor: newMaterial.color2 // BAS = FOND DE SCENE
                      }}
                    >
                      {/* Texture Layer */}
                      {newMaterial.textureUrl && (
                        <div 
                          className="absolute inset-0 opacity-40 mix-blend-overlay"
                          style={{ 
                            backgroundImage: `url(${newMaterial.textureUrl})`,
                            backgroundSize: 'cover'
                          }}
                        />
                      )}
                      
                      {/* Decorative Label Rendering */}
                      <div 
                        className={`relative z-10 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
                          newMaterial.shape === 'circle' ? 'rounded-full' :
                          newMaterial.shape === 'oval' ? 'rounded-full' :
                          newMaterial.shape === 'rounded' ? 'rounded-2xl' :
                          newMaterial.shape === 'square' ? 'rounded-none' :
                          'rounded-none'
                        }`}
                        style={{
                          width: (newMaterial.defaultWidth || 1) * 40,
                          height: (newMaterial.defaultHeight || 1) * 40,
                          backgroundColor: newMaterial.color1 // HAUT = MATIERE
                        }}
                      >
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <span 
                          className="relative z-10 font-bold tracking-widest text-white text-center px-2 break-words"
                          style={{ 
                            fontSize: (newMaterial.shape === 'circle' || newMaterial.shape === 'square')
                              ? Math.min((newMaterial.defaultHeight || 1) * 6, (newMaterial.defaultWidth || 1) * 6)
                              : Math.min((newMaterial.defaultHeight || 1) * 8, (newMaterial.defaultWidth || 1) * 4)
                          }}
                        >
                          {newMaterial.name || 'APERÇU'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-slate-900/50 backdrop-blur-md">
                      <h4 className="font-bold text-xl mb-2">{newMaterial.name || 'Nouveau Matériau'}</h4>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                        {newMaterial.description || 'Apportez une touche de prestige à votre collection avec cette matière haut de gamme.'}
                      </p>
                      <div className="flex justify-between items-end border-t border-white/5 pt-4">
                         <div>
                           <p className="text-[10px] text-gray-500 uppercase font-bold">Prix indicatif (5*2cm)</p>
                           <p className="text-lg font-black text-orange-500">
                             {Math.round(newMaterial.basePrice + (10 * (newMaterial.pricePerSqCm ?? 0)))} FCFA
                           </p>
                         </div>
                         <div className="text-right">
                           {newMaterial.textureUrl ? (
                             <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-bold">TEXTURE ACTIVE</span>
                           ) : (
                             <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded-full font-bold">DÉGRADÉ SEUL</span>
                           )}
                         </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                    <h5 className="font-bold mb-2 flex items-center gap-2 text-orange-400">
                      <Sparkles className="w-4 h-4" /> Conseil Pro
                    </h5>
                    <p className="text-xs text-orange-300/70 leading-relaxed">
                      Utilisez une texture en noir et blanc de haute résolution pour un aspect plus réaliste. Le relief sera plus marqué avec des couleurs de dégradé sombres.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-50">
                   <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                   <p className="text-xl font-bold tracking-widest text-white">CHARGEMENT DU CATALOGUE</p>
                </div>
              ) : materials.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {materials.map((m) => (
                    <Card key={m.id} glass className="p-0 overflow-hidden border-white/5 group hover:border-orange-500/30 transition-all duration-500 shadow-2xl">
                      <div 
                        className="h-48 relative overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: m.color2 }} // FOND
                      >
                         <div className={`relative shadow-xl flex items-center justify-center overflow-hidden ${
                            m.shape === 'circle' ? 'rounded-full' :
                            m.shape === 'oval' ? 'rounded-full' :
                            m.shape === 'rounded' ? 'rounded-xl' :
                            m.shape === 'square' ? 'rounded-none' :
                            'rounded-none'
                         }`}
                         style={{ 
                            width: (m.defaultWidth || 1) * 10,
                            height: (m.defaultHeight || 1) * 10,
                            backgroundColor: m.color1 // MATIERE
                         }}>
                           {/* Texture inside the shape */}
                           {m.textureUrl && (
                             <div 
                               className="absolute inset-0 opacity-40 mix-blend-overlay"
                               style={{ 
                                 backgroundImage: `url(${m.textureUrl})`,
                                 backgroundSize: 'cover'
                               }}
                             />
                           )}
                           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                           <span className="relative z-10 text-[10px] font-bold text-white/50 tracking-widest text-center px-2">{m.name}</span>
                         </div>
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-500" />
                        
                        {/* Action Floatings */}
                        <div className="absolute top-4 right-4 flex gap-2">
                           <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(m); }}
                            className="w-10 h-10 rounded-full bg-orange-500/80 hover:bg-orange-600 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300"
                           >
                             <Settings2 className="w-4 h-4" />
                           </button>
                           <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(m.id!); }}
                            className="w-10 h-10 rounded-full bg-red-600/80 hover:bg-red-600 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300"
                           >
                             <Trash className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{m.name}</h3>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Actif</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">{m.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                           <div>
                             <p className="text-[10px] text-gray-500 uppercase font-bold">Base</p>
                             <p className="font-mono text-white font-bold">{m.basePrice} FCFA</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] text-gray-500 uppercase font-bold">cm²</p>
                             <p className="font-mono text-white font-bold">{(m.pricePerSqCm ?? 0)} FCFA</p>
                           </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Aucun matériau trouvé</h2>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                    Votre catalogue est vide. Commencez par ajouter votre première matière premium pour la rendre disponible dans le designer.
                  </p>
                  <Button size="lg" onClick={() => setIsAdding(true)} icon={<Plus />}>Créer mon premier matériel</Button>
                </div>
              )
              }
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
