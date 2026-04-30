'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Maximize2, 
  Type, 
  Palette, 
  Layers, 
  ShoppingCart, 
  ChevronRight, 
  Check,
  Plus,
  Minus,
  UploadCloud,
  Loader2,
  MessageSquare
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LogoUpload } from './LogoUpload';
import { calculatePrice, getDefaultRule } from '@/lib/pricing/calculator';
import { PricingInput, PricingResult, PricingRule, ProductCategory } from '@/lib/pricing/types';
import { useCartStore } from '@/store/cartStore';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { categoryService } from '@/lib/firebase/categories';
import { materialService, Material } from '@/lib/firebase/materials';
import { settingsService, AppSettings } from '@/lib/firebase/settings';

// Hardcoded materials removed, now fetching from Firebase

export function LabelDesigner() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [config, setConfig] = useState<PricingInput>({
    productType: 'label',
    material: '', // Will be set after loading
    width: 6,
    height: 2,
    quantity: 100,
    options: {
      finish: 'standard',
      technique: 'print',
      customText: true,
    },
    logoSettings: {
      x: 50,
      y: 50,
      scale: 1,
      blendMode: 'normal'
    }
  });
  const [text, setText] = useState('MARQUE');
  const [color, setColor] = useState('#ffffff');
  const [materialColor, setMaterialColor] = useState('#f97316');
  const [fontFamily, setFontFamily] = useState('font-serif');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem } = useCartStore();

  const searchParams = useSearchParams();
  const materialParam = searchParams.get('material');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const [mats, cats, settingsData] = await Promise.all([
          materialService.getAll(),
          categoryService.getAll(),
          settingsService.getSettings()
        ]);
        
        setMaterials(mats);
        setCategories(cats);
        setSettings(settingsData);

        if (mats.length > 0) {
          const preSelected = materialParam 
            ? mats.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === materialParam)
            : null;
          
          const selected = preSelected || mats[0];
          setConfig(prev => ({ 
            ...prev, 
            material: selected.id!,
            productType: selected.productType,
            width: selected.defaultWidth || prev.width,
            height: selected.defaultHeight || prev.height
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, [materialParam]);

  const selectedMaterial = materials.find(m => m.id === config.material) || null;
  const selectedCategory = categories.find(c => c.id === selectedMaterial?.categoryId) || null;

  useEffect(() => {
    if (config.material && selectedMaterial) {
      // Priorité à la couleur de la variante si elle existe
      const activeVariant = selectedMaterial.variants?.find(v => v.id === config.variantId);
      if (activeVariant) {
        setMaterialColor(activeVariant.color);
      } else {
        setMaterialColor(selectedMaterial.color1);
      }
      
      setPricing(calculatePrice(config, selectedMaterial as unknown as PricingRule));
    } else if (config.material && !selectedMaterial) {
      setPricing(calculatePrice(config, getDefaultRule('similicuir')));
    }
  }, [config, materials, selectedMaterial]);

  const handleAddToCart = async () => {
    if (!pricing) return;
    setIsSaving(true);
    
    try {
      const designData = {
        ...config,
        text,
        color,
        materialColor,
        logoUrl,
        createdAt: serverTimestamp(),
      };

      // Save to Firebase (nothing hardcoded, uses db config)
      // Construction d'un nom d'article plus explicite
      const categoryName = categories.find(c => c.id === selectedMaterial?.categoryId)?.name || 'Article';
      const variantName = selectedMaterial?.variants?.find(v => v.id === config.variantId)?.name;
      const itemName = `${selectedMaterial?.name || 'Matière'} ${variantName ? `(${variantName})` : ''} - ${text || 'Sans texte'}`;

      if (db) {
        const docRef = await addDoc(collection(db, 'designs'), designData);
        addItem({
          id: `label-${docRef.id}`,
          productId: `prod-${config.material}`,
          name: itemName,
          categoryName: categoryName,
          material: config.material,
          variantName: variantName,
          quantity: config.quantity,
          unitPrice: pricing.total / config.quantity,
          totalPrice: pricing.total,
          customization: {
            text,
            colors: [color],
            images: logoUrl ? [logoUrl] : [],
            design: { ...config, text, color, logoUrl, firebaseId: docRef.id },
            preview: '', // Placeholder for now
          },
          options: {
            ...config.options,
            width: config.width || 0,
            height: config.height || 0
          }
        });
      } else {
        addItem({
          id: `label-temp-${Date.now()}`,
          productId: `prod-${config.material}`,
          name: itemName,
          categoryName: categoryName,
          material: config.material,
          variantName: variantName,
          quantity: config.quantity,
          unitPrice: pricing.total / config.quantity,
          totalPrice: pricing.total,
          customization: {
            text,
            colors: [color],
            images: logoUrl ? [logoUrl] : [],
            design: { ...config, text, color, logoUrl },
            preview: '', 
          },
          options: {
            ...config.options,
            width: config.width || 0,
            height: config.height || 0
          }
        });
      }
      setShowSuccess(true);
      // alert('Ajouté au panier ! Votre design est maintenant sécurisé.');
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Erreur lors de la sauvegarde du design. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 max-w-7xl mx-auto py-10 px-4">
      {/* Visual Preview Section (Sticky) */}
      <div className="lg:col-span-7">
        <div className="sticky top-24">
          <Card glass className="overflow-hidden p-0 h-[400px] flex items-center justify-center relative bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            
            {/* Realtime Preview Rendering */}
            <motion.div
              layoutId="label-preview"
              className={`relative shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ${
                selectedMaterial?.shape === 'circle' ? 'rounded-full aspect-square' :
                selectedMaterial?.shape === 'oval' ? 'rounded-full' :
                selectedMaterial?.shape === 'rounded' ? 'rounded-lg' :
                selectedMaterial?.shape === 'square' ? 'rounded-none opacity-90' :
                'rounded-sm'
              }`}
              style={{
                width: (selectedMaterial?.shape === 'circle' || selectedMaterial?.shape === 'square') ? (config.height ?? 0) * 40 : (config.width ?? 0) * 40,
                height: (config.height ?? 0) * 40,
                backgroundColor: materialColor
              }}
            >
              {/* Texture Layer */}
              {(selectedMaterial?.variants?.find(v => v.id === config.variantId)?.textureUrl || selectedMaterial?.textureUrl) && (
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{ 
                    backgroundImage: `url(${selectedMaterial?.variants?.find(v => v.id === config.variantId)?.textureUrl || selectedMaterial?.textureUrl})`,
                    backgroundSize: 'cover'
                  }}
                />
              )}
              
                {logoUrl && config.logoSettings && selectedMaterial?.customization?.enableLogo !== false && (
                  <div 
                    className="absolute pointer-events-none"
                    style={{ 
                      left: `${config.logoSettings.x}%`,
                      top: `${config.logoSettings.y}%`,
                      width: `${64 * config.logoSettings.scale}px`,
                      height: `${64 * config.logoSettings.scale}px`,
                      transform: 'translate(-50%, -50%)',
                      mixBlendMode: config.logoSettings.blendMode
                    }}
                  >
                    <Image 
                      src={logoUrl} 
                      alt="Logo preview" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                )}
                {selectedMaterial?.customization?.enableText !== false && (
                  <span 
                    className={`relative z-10 font-bold tracking-widest text-center px-2 ${fontFamily}`}
                    style={{ 
                      color, 
                      fontSize: (selectedMaterial?.shape === 'circle' || selectedMaterial?.shape === 'square')
                        ? Math.min((config.height ?? 0) * 7, (config.width ?? 0) * 4) 
                        : Math.min((config.height ?? 0) * 10, (config.width ?? 0) * 5) 
                    }}
                  >
                    {text || 'VOTRE NOM'}
                  </span>
                )}
              </motion.div>

            {/* Scale indicator */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/50 text-xs">
              <Maximize2 className="w-4 h-4" />
              {selectedMaterial?.shape === 'circle' ? `Diamètre: ${config.height}cm` : 
               selectedMaterial?.shape === 'square' ? `Côté: ${config.height}cm` :
               `${config.width}cm x ${config.height}cm`}
            </div>
          </Card>

          {/* Pricing Summary (Desktop Overlay) */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Card glass className="flex-1 min-w-[200px] border-white/5 bg-white/5 py-4">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Prix Unitaire</p>
              <p className="text-3xl font-black text-white">{pricing?.total ? Math.round(pricing.total / config.quantity) : 0} <span className="text-sm font-normal text-gray-400">FCFA</span></p>
            </Card>
            <Card glass className="flex-1 min-w-[240px] border-orange-500/20 bg-orange-500/5 py-4">
              <p className="text-[10px] text-orange-500 uppercase font-black mb-1">Total ({config.quantity} pcs)</p>
              <p className="text-3xl font-black text-orange-500">{pricing?.total || 0} <span className="text-sm font-normal text-orange-400">FCFA</span></p>
            </Card>
          </div>

          {/* Detailed Description Box (New) */}
          <AnimatePresence mode="wait">
            {(selectedMaterial || config.variantId) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-8"
              >
                <Card glass className="border-white/5 bg-gradient-to-r from-white/5 to-transparent p-6">
                   <div className="flex items-start gap-4">
                     <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                        <Sparkles className="w-6 h-6" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Fiche technique du produit</h4>
                       <h3 className="text-xl font-black text-white mb-2">
                         {selectedMaterial?.name} 
                         {config.variantId && selectedMaterial?.variants?.find(v => v.id === config.variantId) && (
                           <span className="text-orange-500 ml-2">
                             — {selectedMaterial.variants.find(v => v.id === config.variantId)?.name}
                           </span>
                         )}
                       </h3>
                       <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                         {config.variantId && selectedMaterial?.variants?.find(v => v.id === config.variantId)?.description 
                           ? selectedMaterial.variants.find(v => v.id === config.variantId)?.description 
                           : selectedMaterial?.description}
                       </p>
                     </div>
                   </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 text-green-500">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Article ajouté !</h4>
                    <p className="text-xs opacity-80">Votre design est sauvegardé.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/cart">
                    <Button size="sm" variant="primary">Voir le Panier</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setShowSuccess(false)}>Continuer</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="lg:col-span-5 space-y-6">
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex items-center gap-2 ${activeStep >= step ? 'text-orange-500' : 'text-gray-500'}`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${activeStep >= step ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'}`}>
                {step}
              </div>
              <span className="hidden sm:inline font-medium text-sm">
                {step === 1 ? 'Matériau' : step === 2 ? 'Design' : 'Commande'}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-500" />
                    Choisissez votre matériau
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {loadingMaterials ? (
                      <div className="flex flex-col items-center py-10 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Chargement des textures...</p>
                      </div>
                    ) : (
                      materials.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setConfig({ 
                            ...config, 
                            material: m.id!, 
                            productType: m.productType,
                            width: m.defaultWidth || config.width,
                            height: m.defaultHeight || config.height
                          })}
                          className={`p-4 rounded-xl text-left transition-all border ${
                            config.material === m.id 
                              ? 'bg-white/10 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]' 
                              : 'bg-transparent border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg relative overflow-hidden" 
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
                            </div>
                            <div>
                              <p className="text-white font-semibold">{m.name}</p>
                              <p className="text-gray-400 text-xs line-clamp-1">{m.description}</p>
                              
                              {/* Variants list if active material */}
                              {config.material === m.id && m.variants && m.variants.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                  {m.variants.map((v) => (
                                    <button
                                      key={v.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfig({ ...config, variantId: v.id });
                                        setMaterialColor(v.color);
                                      }}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                                        config.variantId === v.id 
                                          ? 'bg-orange-500 text-white shadow-lg' 
                                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                      }`}
                                    >
                                      <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: v.color }} />
                                      <div className="text-left">
                                        <div>{v.name}</div>
                                        {v.description && <div className="text-[8px] opacity-60 font-normal normal-case line-clamp-1">{v.description}</div>}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            {config.material === m.id && <Check className="ml-auto text-orange-500" />}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    icon={<ChevronRight />} 
                    onClick={() => setActiveStep(2)}
                  >
                    Suivant : Personnaliser
                  </Button>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {(selectedMaterial?.customization?.enableDimensions !== false || 
                    selectedMaterial?.customization?.enableMaterialColor !== false || 
                    selectedMaterial?.customization?.enableText !== false || 
                    selectedMaterial?.customization?.enableMarkingColor !== false) && (
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Type className="w-5 h-5 text-orange-500" />
                      Dimensions & Texte
                    </h3>
                  )}
                  {selectedCategory?.pricingModel !== 'unit' && selectedMaterial?.customization?.enableDimensions !== false && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Largeur (cm)" 
                        type="number" 
                        className="bg-white/5 border-white/10 text-white"
                        value={config.width}
                        onChange={(e) => setConfig({ ...config, width: Math.max(1, Number(e.target.value)) })}
                      />
                      <Input 
                        label="Hauteur (cm)" 
                        type="number" 
                        className="bg-white/5 border-white/10 text-white"
                        value={config.height}
                        onChange={(e) => setConfig({ ...config, height: Math.max(1, Number(e.target.value)) })}
                      />
                    </div>
                  )}
                  {selectedMaterial?.customization?.enableMaterialColor !== false && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Couleur du matériau (Cuir/Tissu)
                      </label>
                      <div className="flex gap-2 flex-wrap items-center">
                        {['#f97316', '#9a3412', '#1e293b', '#000000', '#166534', '#1e3a8a', '#701a75'].map(c => (
                          <button
                            key={c}
                            onClick={() => setMaterialColor(c)}
                            className={`w-8 h-8 rounded-full border-2 ${materialColor === c ? 'border-orange-500 scale-125' : 'border-white/20'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <div className="relative w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500">
                          <input 
                            type="color" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-[2]" 
                            value={materialColor}
                            onChange={(e) => setMaterialColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMaterial?.customization?.enableText !== false && (
                    <Input 
                      label="Texte sur l'étiquette" 
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Votre texte ici"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                  )}

                  {selectedMaterial?.customization?.enableMarkingColor !== false && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Couleur du marquage (Impression)
                      </label>
                      <div className="flex gap-2 flex-wrap items-center">
                        {['#ffffff', '#000000', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#fbbf24'].map(c => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-orange-500 scale-125' : 'border-white/20'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <div className="relative w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500">
                          <input 
                            type="color" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-[2]" 
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMaterial?.customization?.enableFonts !== false && (
                    <div>
                       <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                         <Type className="w-4 h-4" /> Style de police
                       </label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            { id: 'font-serif', name: 'Élégant' },
                            { id: 'font-mono', name: 'Moderne' },
                            { id: 'font-sans', name: 'Minimal' },
                            { id: 'font-bold italic', name: 'Cursive' },
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => setFontFamily(f.id)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                fontFamily === f.id ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                              }`}
                            >
                              {f.name}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {selectedMaterial?.customization?.enableLogo !== false && (
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-orange-500" /> Ajouter un logo (optionnel)
                      </label>
                      <LogoUpload 
                        onUpload={setLogoUrl} 
                        onRemove={() => setLogoUrl(null)} 
                        value={logoUrl || undefined} 
                      />
                      {logoUrl && config.logoSettings && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-6 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10 space-y-4"
                        >
                          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500">Réglages du logo</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-400">Position X</label>
                              <input 
                                  type="range" min="0" max="100" 
                                  className="w-full accent-orange-500 bg-white/5"
                                  value={config.logoSettings.x}
                                  onChange={(e) => setConfig({
                                    ...config, 
                                    logoSettings: { ...config.logoSettings!, x: Number(e.target.value) }
                                  })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] text-gray-400">Position Y</label>
                              <input 
                                  type="range" min="0" max="100" 
                                  className="w-full accent-orange-500 bg-white/5"
                                  value={config.logoSettings.y}
                                  onChange={(e) => setConfig({
                                    ...config, 
                                    logoSettings: { ...config.logoSettings!, y: Number(e.target.value) }
                                  })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] text-gray-400">Taille du logo</label>
                              <input 
                                type="range" min="0.2" max="3" step="0.1"
                                className="w-full accent-orange-500 bg-white/5"
                                value={config.logoSettings.scale}
                                onChange={(e) => setConfig({
                                  ...config, 
                                  logoSettings: { ...config.logoSettings!, scale: Number(e.target.value) }
                                })}
                              />
                          </div>

                          <div className="pt-2">
                            <label className="text-[10px] text-gray-400 mb-2 block">Effet de rendu</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => setConfig({
                                    ...config, 
                                    logoSettings: { ...config.logoSettings!, blendMode: 'normal' }
                                  })}
                                  className={`py-2 rounded-lg text-[10px] font-bold border ${config.logoSettings.blendMode === 'normal' ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                  Réel (Photo)
                                </button>
                                <button 
                                  onClick={() => setConfig({
                                    ...config, 
                                    logoSettings: { ...config.logoSettings!, blendMode: 'multiply' }
                                  })}
                                  className={`py-2 rounded-lg text-[10px] font-bold border ${config.logoSettings.blendMode === 'multiply' ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                >
                                  Incrusté (Fusion)
                                </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setActiveStep(1)}>
                    Retour
                  </Button>
                  <Button className="flex-1" icon={<ChevronRight />} onClick={() => setActiveStep(3)}>
                    Finitions
                  </Button>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      Options Finales
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-400">Quantité de Commande</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xl font-black text-orange-500 outline-none focus:border-orange-500 transition-all"
                            value={config.quantity || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setConfig({ ...config, quantity: val });
                            }}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 uppercase tracking-widest">Pièces</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => setConfig({ ...config, quantity: config.quantity + 50 })}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-400"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setConfig({ ...config, quantity: Math.max(10, config.quantity - 50) })}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-gray-400"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 italic mt-2">Saisissez la quantité exacte dont vous avez besoin.</p>
                    </div>

                    {selectedMaterial?.discounts && selectedMaterial.discounts.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Prix dégressifs</p>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedMaterial.discounts.sort((a,b) => a.quantity - b.quantity).map((tier, idx) => {
                            const isReached = config.quantity >= tier.quantity;
                            return (
                              <div 
                                key={idx} 
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  isReached 
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                    : 'bg-white/5 border-white/10 text-gray-400'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isReached ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                                  <span className="text-xs font-bold">Dès {tier.quantity} pièces</span>
                                </div>
                                <span className="text-xs font-black">-{tier.discountPercentage}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-6">
                  <Button variant="outline" className="flex-1 min-w-[100px]" onClick={() => setActiveStep(2)}>
                    Retour
                  </Button>

                  {settings?.whatsapp && (
                    <Button 
                      variant="outline" 
                      className="flex-1 min-w-[100px] border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10" 
                      icon={<MessageSquare className="w-4 h-4" />}
                      onClick={() => {
                        const cleanNumber = settings.whatsapp?.replace(/\D/g, '');
                        const totalDisplay = pricing?.total || 0;
                        const textMsg = `Bonjour LabelEric !\n\nJ'aimerais valider ce design avec vous :\n\n- Produit : ${selectedMaterial?.name}\n- Matière : ${selectedMaterial?.name}\n- Dimensions : ${config.width}x${config.height} cm\n- Marquage : ${text}\n- Quantité : ${config.quantity} pcs\n- Estimation : ${totalDisplay.toLocaleString()} FCFA\n\nQu'en pensez-vous ?`;
                        window.open(`https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(textMsg)}`, '_blank');
                      }}
                    >
                      WhatsApp
                    </Button>
                  )}

                  <Button 
                    className="flex-[2] min-w-[200px]" 
                    variant="primary" 
                    icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart />} 
                    onClick={handleAddToCart}
                    loading={isSaving}
                  >
                    Ajouter au panier
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
