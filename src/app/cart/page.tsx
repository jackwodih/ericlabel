'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChevronLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, itemCount } = useCartStore();

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    updateQuantity(itemId, newQty);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />

      <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Panier</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {itemCount > 0 
                ? `Vous avez ${itemCount} article(s) prêt pour la commande` 
                : "Votre panier est actuellement vide."}
            </p>
          </div>
          <Link href="/designer">
            <Button variant="outline" icon={<ChevronLeft className="w-4 h-4" />}>
              Continuer vers le Designer
            </Button>
          </Link>
        </div>

        {itemCount > 0 ? (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card glass className="flex flex-col sm:flex-row gap-6 p-5 border-white/5 group hover:border-white/20 transition-all">
                      {/* Item Preview */}
                      <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${
                          item.material === 'similicuir' ? 'from-amber-600 to-orange-800' :
                          item.material === 'satin' ? 'from-pink-500 to-rose-600' :
                          item.material === 'tisse' ? 'from-blue-600 to-cyan-800' :
                          'from-gray-400 to-slate-600'
                        }`} />
                        <div className="relative z-10 text-center font-bold tracking-widest text-[10px] sm:text-xs">
                          {item.customization?.text || 'DESIGN'}
                        </div>
                        {item.customization?.images?.[0] && (
                          <div className="absolute z-10 w-1/2 h-1/2">
                            <Image 
                              src={item.customization.images[0]} 
                              alt="Logo" 
                              fill
                              className="object-contain mix-blend-multiply opacity-80" 
                            />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {item.material}</span>
                              <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {item.options.width}x{item.options.height}cm</span>
                              {item.options.technique && <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {item.options.technique}</span>}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3 bg-white/5 rounded-full p-1 border border-white/10">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 50)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-16 text-center font-mono font-bold">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 50)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs uppercase tracking-wider">Total article</p>
                            <p className="text-xl font-bold text-orange-500">{item.totalPrice.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4 sticky top-32 space-y-6">
              <Card glass className="border-orange-500/20 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
                <h3 className="text-2xl font-bold mb-6">Récapitulatif</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span className="text-white font-medium">{total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-gray-400 border-b border-white/5 pb-4">
                    <span>Estimation livraison</span>
                    <span className="text-green-500 font-medium">Offerte</span>
                  </div>
                  <div className="flex justify-between text-2xl font-black pt-2">
                    <span>Total</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">
                      {total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/checkout">
                    <Button className="w-full text-lg py-5 group shadow-orange-600/20" icon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}>
                      Passer au Checkout
                    </Button>
                  </Link>
                  <p className="text-[10px] text-gray-500 text-center uppercase tracking-widest mt-4">
                    Paiement sécurisé par
                  </p>
                  <div className="flex justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
                     <CreditCard className="w-8 h-8" />
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                </div>
              </Card>

              {/* Trust Section */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Livraison Express</p>
                    <p className="text-xs text-gray-400">48h vers Abidjan, Bamako, Dakar</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Qualité Garantie</p>
                    <p className="text-xs text-gray-400">100% Satisfaction ou ré-impression</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Votre panier est vide</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Il est temps d&apos;apporter du prestige à votre marque. <br />
              Commencez à configurer vos étiquettes personnalisées.
            </p>
            <Link href="/designer">
              <Button size="lg" icon={<ArrowRight />}>
                Lancer le Designer
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Bg Decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
