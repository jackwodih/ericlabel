
'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { settingsService, AppSettings } from '@/lib/firebase/settings';

export function WhatsAppContact() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
    
    // Apparaît après 2 secondes pour ne pas gêner immédiatement
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!settings?.whatsapp || !isVisible) return null;

  // Nettoyage du numéro (garde uniquement les chiffres pour l'URL)
  const cleanNumber = settings.whatsapp.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent("Bonjour LabelEric, j'aimerais avoir des informations sur vos produits.")}`;

  return (
    <div className="fixed bottom-6 left-6 z-[60]">
      <AnimatePresence>
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-3 bg-[#25D366] text-white p-4 rounded-full shadow-2xl shadow-green-500/20 hover:bg-[#20ba5a] transition-all group"
        >
          <div className="flex flex-col items-end mr-2 md:block hidden">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Besoin d'aide ?</span>
            <span className="text-xs font-bold">Contactez-nous</span>
          </div>
          <div className="relative">
             <MessageCircle className="w-6 h-6 fill-white/20" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-[#25D366] rounded-full animate-pulse" />
          </div>
        </motion.a>
      </AnimatePresence>
    </div>
  );
}
