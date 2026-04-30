
'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { FileText, Shield } from 'lucide-react';

export default function LegalPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const legalContent = settings?.legalInfoLong || `
    Les présentes mentions légales définissent les règles d'utilisation de notre site web.
    
    1. Édition du site
    Le présent site est édité par Label Eric, spécialisé dans l'étiquetage premium.
    
    2. Hébergement
    Le site est hébergé par Netlify.
    
    3. Propriété intellectuelle
    Tous les contenus présents sur ce site sont la propriété exclusive de Label Eric.
  `;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-widest">
            <Shield className="w-3 h-3" /> Transparence
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
            Mentions <span className="text-purple-500">Légales</span>
          </h1>
          <p className="text-gray-400">
            Dernière mise à jour : {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-headings:text-white prose-p:leading-relaxed space-y-6">
            <div className="flex items-center gap-2 text-purple-500 mb-8">
              <FileText className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Document Officiel</span>
            </div>
            
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-light italic">
              {legalContent}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">
            Label Eric — Excellence et Engagement
          </p>
        </div>
      </main>
    </div>
  );
}
