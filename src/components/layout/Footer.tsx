
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { 
  Facebook, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone,
  ArrowRight
} from 'lucide-react';

// Icônes personnalisées pour TikTok et Pinterest si manquantes
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

import Image from 'next/image';

export function Footer() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const socialLinks = [
    { id: 'facebook', icon: <Facebook className="w-5 h-5" />, url: settings?.facebook, color: 'hover:text-blue-500' },
    { id: 'tiktok', icon: <TikTokIcon />, url: settings?.tiktok, color: 'hover:text-pink-500' },
    { id: 'youtube', icon: <Youtube className="w-5 h-5" />, url: settings?.youtube, color: 'hover:text-red-500' },
    { id: 'pinterest', icon: <PinterestIcon />, url: settings?.pinterest, color: 'hover:text-red-600' },
  ].filter(link => link.url);

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Social */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              {settings?.logoUrl ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-orange-500/50 transition-colors">
                  <Image 
                    src={settings.logoUrl} 
                    alt="Logo Label Eric" 
                    width={48}
                    height={48}
                    className="object-contain w-full h-full p-1"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                  L
                </div>
              )}
              <span className="text-2xl font-black tracking-tighter uppercase text-white group-hover:text-orange-500 transition-colors">
                Label Eric
              </span>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Expertise premium en étiquetage et marquage pour les marques de mode et créateurs en Afrique.
            </p>
            
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map(link => (
                  <a 
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all ${link.color} hover:bg-white/10 hover:border-white/20 hover:-translate-y-1`}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Rapide */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Navigation</h3>
            <ul className="space-y-4">
              <li><Link href="/catalogue" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Catalogue Produits</Link></li>
              <li><Link href="/designer" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Designer en Ligne</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Blog & Conseils</Link></li>
            </ul>
          </div>

          {/* Aide & Support */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">Foire aux questions</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contactez-nous</Link></li>
              <li><Link href="/legal" className="text-gray-400 hover:text-white text-sm transition-colors">Mentions Légales</Link></li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Contact</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3 text-sm text-gray-400 group">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Localisation</span>
                  <span>{settings?.address || 'Adresse non configurée'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-400 group">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Téléphone</span>
                  <span>{settings?.phone || settings?.whatsapp || 'Non configuré'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Email</span>
                  <span>{settings?.contactEmail || 'Non configuré'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Label Eric. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest italic tracking-[0.2em]">L&apos;excellence de l&apos;étiquetage premium</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
