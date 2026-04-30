'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Filter, 
  LayoutGrid, 
  Loader2,
  ArrowRight,
  Palette,
  Maximize2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { materialService, Material } from '@/lib/firebase/materials';
import { categoryService, Category } from '@/lib/firebase/categories';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CatalogueContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mats, cats] = await Promise.all([
          materialService.getAll(),
          categoryService.getAll()
        ]);
        setMaterials(mats);
        setCategories(cats);
      } catch (error) {
        console.error("Erreur lors du chargement du catalogue:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMaterials = selectedCategory 
    ? materials.filter(m => m.categoryId === selectedCategory)
    : materials;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Chargement du catalogue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-1px bg-orange-500" />
              <span className="text-orange-500 font-bold uppercase tracking-[0.3em] text-xs">Collection Premium</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Explorez nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Matières</span> d'exception
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-2xl">
              Chaque étiquette raconte une histoire. Choisissez la matière qui sublimera vos créations parmi notre sélection rigoureuse de cuirs, tissus et bois.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter & Grid Section */}
      <section className="container mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-64 space-y-8 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">
                <Filter className="w-4 h-4" />
                Filtrer par Univers
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                    selectedCategory === null 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-bold">Tout voir</span>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id!)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${
                      selectedCategory === cat.id 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="font-bold">{cat.name}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
              <Sparkles className="w-6 h-6 text-orange-500 mb-4" />
              <h4 className="font-bold mb-2 text-sm">Besoin d'aide ?</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                Notre équipe vous accompagne dans le choix de la matière idéale pour votre projet.
              </p>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory || 'all'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {filteredMaterials.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link href={`/designer?material=${m.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <Card glass className="group p-0 overflow-hidden border-white/5 hover:border-orange-500/40 transition-all duration-500 h-full flex flex-col">
                        <div 
                          className="h-64 relative overflow-hidden flex items-center justify-center p-12 transition-colors duration-700"
                          style={{ backgroundColor: m.color2 }}
                        >
                          <div 
                            className={`relative z-10 w-full aspect-square max-w-[140px] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                              m.shape === 'circle' ? 'rounded-full' :
                              m.shape === 'oval' ? 'rounded-full' :
                              m.shape === 'rounded' ? 'rounded-2xl' :
                              'rounded-none'
                            }`}
                            style={{ backgroundColor: m.color1 }}
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
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            <span className="relative z-10 text-[8px] font-black tracking-widest text-white/40 uppercase text-center px-2">
                              {m.name}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                              <Palette className="w-5 h-5" />
                            </div>
                          </div>
                          
                          <div className="absolute top-4 left-4">
                            <span className="text-[9px] font-black bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded tracking-[0.2em] uppercase border border-white/10">
                              {categories.find(c => c.id === m.categoryId)?.name || 'Matière'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{m.name}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1">
                            {m.description || 'Apportez une touche de prestige à vos créations avec cette matière haut de gamme.'}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                              À partir de
                              <div className="text-lg text-white font-black mt-1">
                                {m.basePrice + (m.pricePerUnit || 0)} <span className="text-[10px] text-gray-500">FCFA</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 transition-all duration-300">
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                <Layers className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-400">Aucune matière dans cet univers</h3>
                <p className="text-gray-500 text-sm">Découvrez nos autres collections dans le menu à gauche.</p>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div className="p-12 rounded-[2rem] bg-gradient-to-r from-orange-600 to-rose-600 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Prêt à créer votre propre étiquette ?</h2>
              <p className="text-white/80 font-medium">Accédez à notre configurateur 3D ultra-puissant.</p>
            </div>
            <Link href="/designer">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-6 text-lg font-black shadow-2xl">
                LANCER LE DESIGNER <Sparkles className="ml-2 w-5 h-5 text-orange-600" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-orange-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-rose-600/5 rounded-full blur-[160px]" />
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Initialisation...</p>
      </div>
    }>
      <CatalogueContent />
    </Suspense>
  );
}
