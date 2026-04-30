
'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Info Side */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                <MessageSquare className="w-3 h-3" /> Communication
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
                Parlons de votre <span className="text-blue-500">Projet</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-md">
                Vous avez une question ou un projet spécifique ? Notre équipe d&apos;experts est là pour vous conseiller.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Email</h3>
                  <p className="text-lg font-bold">{settings?.contactEmail || 'contact@labeleric.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-500 flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Téléphone & WhatsApp</h3>
                  <p className="text-lg font-bold">{settings?.phone || settings?.whatsapp || '+225 ...'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Localisation</h3>
                  <p className="text-lg font-bold">{settings?.address || 'Lomé, Togo'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nom Complet</label>
                  <Input placeholder="Votre nom" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email</label>
                  <Input type="email" placeholder="votre@email.com" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Sujet</label>
                <Input placeholder="Comment pouvons-nous vous aider ?" className="bg-white/5 border-white/10 h-14 rounded-2xl" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Message</label>
                <textarea 
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Détails de votre demande..."
                />
              </div>

              <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs group">
                Envoyer le message <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
