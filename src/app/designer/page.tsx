import React from 'react';
import { LabelDesigner } from '@/components/designer/LabelDesigner';
import { Navbar } from '@/components/layout/Navbar';

export default function DesignerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Configurez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Label de Marque</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Personnalisez chaque détail : matériau, dimensions, texte et finitions. 
            Aperçu en temps réel et fabrication premium sous 48h.
          </p>
        </div>

        <React.Suspense fallback={<div className="text-center py-20">Chargement du configurateur...</div>}>
          <LabelDesigner />
        </React.Suspense>
      </main>

      {/* Footer / Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
