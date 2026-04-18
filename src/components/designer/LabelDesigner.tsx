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
  Info,
  Check,
  UploadCloud,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LogoUpload } from './LogoUpload';
import { calculatePrice, getDefaultRule } from '@/lib/pricing/calculator';
import { PricingInput, PricingResult, PricingRule } from '@/lib/pricing/types';
import { useCartStore } from '@/store/cartStore';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { materialService, Material } from '@/lib/firebase/materials';

// Hardcoded materials removed, now fetching from Firebase

export function LabelDesigner() {
  const [materials, setMaterials] = useState<Material[]>([]);
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
        const data = await materialService.getAll();
        setMaterials(data);
        if (data.length > 0) {
          // Si un paramètre material existe, on cherche le matériel correspondant
          const preSelected = materialParam 
            ? data.find(m => m.name.toLowerCase().replace(/\s+/g, '-') === materialParam)
            : null;
          
          const selected = preSelected || data[0];
          setConfig(prev => ({ 
            ...prev, 
            material: selected.id!,
            productType: selected.productType 
          }));
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, [materialParam]);

  useEffect(() => {
    if (config.material) {
      const selectedMaterial = materials.find(m => m.id === config.material);
      if (selectedMaterial) {
        setMaterialColor(selectedMaterial.color1);
        setPricing(calculatePrice(config, selectedMaterial as unknown as PricingRule));
      } else {
        setPricing(calculatePrice(config, getDefaultRule('similicuir')));
      }
    }
  }, [config, materials]);

  const selectedMaterial = materials.find(m => m.id === config.material);

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
      if (db) {
        const docRef = await addDoc(collection(db, 'designs'), designData);
        addItem({
          id: `label-${docRef.id}`,
          productId: `prod-${config.material}`,
          name: `Étiquette ${config.material}`,
          material: config.material,
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
            width: config.width,
            height: config.height
          }
        });
      } else {
        // Local only add if db is missing (should not happen in browser)
        addItem({
          id: `label-temp-${Date.now()}`,
          productId: `prod-${config.material}`,
          name: `Étiquette ${config.material}`,
          material: config.material,
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
            width: config.width,
            height: config.height
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
              className={`relative shadow-2xl overflow-hidden rounded-sm flex items-center justify-center`}
              style={{
                width: config.width * 40,
                height: config.height * 40,
                backgroundColor: materialColor
              }}
            >
              {/* Texture Layer */}
              {selectedMaterial?.textureUrl && (
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{ 
                    backgroundImage: `url(${selectedMaterial.textureUrl})`,
                    backgroundSize: 'cover'
                  }}
                />
              )}
              
                {logoUrl && (
                  <div className="absolute left-4 w-12 h-12">
                    <Image 
                      src={logoUrl} 
                      alt="Logo preview" 
                      fill 
                      className="object-contain mix-blend-multiply opacity-80" 
                    />
                  </div>
                )}
                <span 
                  className={`relative z-10 font-bold tracking-widest text-center ${fontFamily}`}
                  style={{ color, fontSize: Math.min(config.height * 10, config.width * 5) }}
                >
                  {text || 'VOTRE NOM'}
                </span>
              </motion.div>

            {/* Scale indicator */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white/50 text-xs">
              <Maximize2 className="w-4 h-4" />
              {config.width}cm x {config.height}cm
            </div>
          </Card>

          {/* Pricing Summary (Desktop Overlay) */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex-1 border border-white/10">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Prix Unitaire</p>
              <p className="text-2xl font-bold text-white">
                {pricing ? Math.round(pricing.total / config.quantity) : 0} <span className="text-sm font-normal text-gray-400">FCFA</span>
              </p>
            </div>
            <div className="bg-orange-600/20 backdrop-blur-md rounded-xl p-4 flex-1 border border-orange-500/30">
              <p className="text-orange-200 text-sm uppercase tracking-wider mb-1">Total ({config.quantity} pcs)</p>
              <p className="text-2xl font-bold text-orange-500">
                {pricing ? Math.round(pricing.total) : 0} <span className="text-sm font-normal text-orange-300">FCFA</span>
              </p>
            </div>
          </div>

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
                          onClick={() => setConfig({ ...config, material: m.id!, productType: m.productType })}
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
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Type className="w-5 h-5 text-orange-500" />
                    Dimensions & Texte
                  </h3>
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

                  <Input 
                    label="Texte sur l'étiquette" 
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Votre texte ici"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
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

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                       <UploadCloud className="w-4 h-4 text-orange-500" /> Ajouter un logo (optionnel)
                    </label>
                    <LogoUpload 
                      onUpload={setLogoUrl} 
                      onRemove={() => setLogoUrl(null)} 
                      value={logoUrl || undefined} 
                    />
                  </div>
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
                      <input 
                        type="range" 
                        min="50" 
                        max="1000" 
                        step="50"
                        className="w-full accent-orange-600"
                        value={config.quantity}
                        onChange={(e) => setConfig({ ...config, quantity: Number(e.target.value) })}
                      />
                      <div className="flex justify-between text-xs text-gray-500 pt-1 font-mono">
                        <span>50 pcs</span>
                        <span className="text-orange-500 font-bold">{config.quantity} pcs</span>
                        <span>1000 pcs</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-orange-600/10 border border-orange-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-300">
                            <b>Saviez-vous ?</b><br />
                            À partir de 500 pièces, vous bénéficiez de <b>-35%</b> sur le prix unitaire.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setActiveStep(2)}>
                    Retour
                  </Button>
                  <Button 
                    className="flex-[2]" 
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
