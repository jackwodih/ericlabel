'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoUpload } from '@/components/designer/LogoUpload';
import { materialService, Material } from '@/lib/firebase/materials';
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
  Save
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
    textureUrl: ''
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
  }, []);

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
                            <label className="block text-sm font-medium text-gray-400">Type de Produit</label>
                            <select 
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                              value={newMaterial.productType}
                              onChange={e => setNewMaterial({...newMaterial, productType: e.target.value as any})}
                            >
                              <option value="label">Étiquette / Ruban</option>
                              <option value="button">Bouton</option>
                              <option value="packaging">Emballage / Boîte</option>
                              <option value="accessory">Accessoire</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-400">Modèle de Tarification</label>
                            <select 
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                              value={newMaterial.pricingModel}
                              onChange={e => setNewMaterial({...newMaterial, pricingModel: e.target.value as any})}
                            >
                              <option value="surface">Par Surface (cm²)</option>
                              <option value="unit">Par Unité (Pièce)</option>
                              <option value="volume">Par Volume (cm³)</option>
                            </select>
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
                               <p className="text-[10px] text-gray-500 uppercase font-bold">Couleur Haut</p>
                               <input 
                                type="color" 
                                className="w-full h-12 rounded-lg bg-transparent cursor-pointer border-none"
                                value={newMaterial.color1}
                                onChange={e => setNewMaterial({...newMaterial, color1: e.target.value})}
                               />
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="flex-1 space-y-1">
                               <p className="text-[10px] text-gray-500 uppercase font-bold">Couleur Bas</p>
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
                        background: `linear-gradient(to bottom right, ${newMaterial.color1}, ${newMaterial.color2})`
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
                      <div className="relative z-10 w-full aspect-[3/1] bg-white/10 backdrop-blur-sm border border-white/20 rounded shadow-2xl flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <span className="relative z-10 font-bold tracking-[0.3em] text-white text-lg drop-shadow-lg">
                          {newMaterial.name || 'NOM DU MATÉRIAU'}
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
                             {Math.round(newMaterial.basePrice + (10 * newMaterial.pricePerSqCm))} FCFA
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
                        style={{ background: `linear-gradient(to bottom right, ${m.color1}, ${m.color2})` }}
                      >
                         {m.textureUrl && (
                          <div 
                            className="absolute inset-0 opacity-40 mix-blend-overlay"
                            style={{ 
                              backgroundImage: `url(${m.textureUrl})`,
                              backgroundSize: 'cover'
                            }}
                          />
                        )}
                        <div className="relative z-10 w-2/3 aspect-[3/1] bg-white/10 border border-white/20 rounded flex items-center justify-center font-bold tracking-[0.2em] text-xs shadow-2xl">
                          {m.name}
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
                             <p className="font-mono text-white font-bold">{m.pricePerSqCm} FCFA</p>
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
