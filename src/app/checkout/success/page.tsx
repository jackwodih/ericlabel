
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Package, ArrowRight, Download, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Merci pour votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Commande !</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto">
            Votre paiement a été traité avec succès. Nous allons commencer la personnalisation de vos étiquettes immédiatement.
          </p>

          <Card glass className="p-8 border-white/5 bg-white/5 mb-12 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Numéro de commande</p>
                <h3 className="text-xl font-mono font-bold">#{orderId?.slice(-8).toUpperCase() || 'LBL-XXXX'}</h3>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button variant="outline" size="sm" className="flex-1 md:flex-none border-white/10">
                  <Download className="w-4 h-4 mr-2" /> Reçu PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1 md:flex-none border-white/10">
                  <Mail className="w-4 h-4 mr-2" /> Suivi
                </Button>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Statut</p>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">
                  CONFIRMÉ
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Expédition</p>
                <p className="text-sm font-bold">En attente de prod.</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Délai estimé</p>
                <p className="text-sm font-bold">3 à 5 jours ouvrés</p>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => router.push('/catalogue')}
              className="w-full sm:w-auto px-8"
            >
              Continuer mes achats <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-8 border-white/10"
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
