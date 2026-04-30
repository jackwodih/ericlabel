'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Truck, CreditCard, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { materialService, Material } from '@/lib/firebase/materials';

export default function HomePage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await materialService.getAll();
        setMaterials(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Qualité Premium",
      description: "Matériaux de première qualité et finitions impeccables",
      color: "text-yellow-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "100% Personnalisable",
      description: "Outil de création intuitif avec aperçu en temps réel",
      color: "text-blue-500",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Livraison Rapide",
      description: "Production express disponible, livraison dans toute l'Afrique",
      color: "text-green-500",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Paiement Facile",
      description: "Orange Money, MTN Money, CinetPay et plus encore",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" 
               style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Créez des étiquettes personnalisées de qualité professionnelle
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Similicuir, Satin, Tissé, Métal, Acrylique - Livraison dans toute l&apos;Afrique
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/designer">
              <button className="px-8 py-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto">
                Commencer la création
              </button>
            </Link>
            <Link href="/catalogue">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-lg font-semibold hover:bg-white/20 transition w-full sm:w-auto">
                Voir le catalogue
              </button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Clients satisfaits' },
              { value: '50,000+', label: 'Étiquettes créées' },
              { value: '5', label: 'Matériaux premium' },
              { value: '48h', label: 'Livraison express' },
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nos Matériaux
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? (
              <div className="col-span-full flex flex-col items-center py-20 opacity-50">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
                <p className="text-white">Chargement du catalogue...</p>
              </div>
            ) : materials.length === 0 ? (
               <div className="col-span-full text-center py-20 opacity-50">
                <p className="text-white italic">Aucun matériau configuré pour le moment.</p>
              </div>
            ) : (
              materials.map((material, index) => (
                <Link 
                  key={index}
                  href={`/designer?material=${material.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-0 overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-orange-500/20"
                >
                  <div 
                    className="h-32 relative overflow-hidden"
                    style={{ background: `linear-gradient(to bottom right, ${material.color1}, ${material.color2})` }}
                  >
                    {material.textureUrl && (
                      <div 
                        className="absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{ 
                          backgroundImage: `url(${material.textureUrl})`,
                          backgroundSize: 'cover'
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500 flex items-center justify-center">
                       <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold tracking-widest uppercase">
                         Personnaliser
                       </span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/40">
                    <h3 className="text-white font-bold text-center group-hover:text-orange-400 transition-colors">
                      {material.name}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi nous choisir
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className={`${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ce que disent nos clients
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">
                  &quot;Service exceptionnel, qualité irréprochable. Je recommande vivement !&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500" />
                  <div>
                    <div className="text-white font-semibold">Client {i}</div>
                    <div className="text-gray-400 text-sm">Entrepreneur</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>© 2024 Label Création. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}