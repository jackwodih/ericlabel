
'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const faqs = settings?.faq || [
    { 
      question: "Comment puis-je passer commande ?", 
      answer: "Vous pouvez passer commande directement via notre catalogue ou utiliser notre outil de design en ligne pour personnaliser vos propres étiquettes." 
    },
    { 
      question: "Quels sont vos délais de fabrication ?", 
      answer: "Nos délais habituels sont de 3 à 5 jours ouvrés après validation de votre design, plus le temps de livraison selon votre zone." 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
            <HelpCircle className="w-3 h-3" /> Aide & Support
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
            Foire aux <span className="text-orange-500">Questions</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Retrouvez ici les réponses aux questions les plus fréquentes sur nos produits, la personnalisation et la livraison.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden transition-all hover:border-orange-500/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <span className="font-bold text-lg group-hover:text-orange-500 transition-colors">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-orange-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-orange-500" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-orange-600/20 to-transparent border border-orange-600/20 text-center space-y-6">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-600/20">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Vous ne trouvez pas votre réponse ?</h3>
            <p className="text-gray-400 text-sm">
              Notre équipe est disponible pour vous accompagner dans votre projet d&apos;étiquetage.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <a 
              href="/contact" 
              className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-orange-500 hover:text-white transition-all"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
