'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LogoUpload } from '@/components/designer/LogoUpload';
import { shippingService, ShippingZone } from '@/lib/firebase/shipping';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { 
  Plus, 
  MapPin, 
  Trash, 
  Save, 
  ChevronLeft,
  Truck,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminShippingPage() {
  const router = useRouter();
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<AppSettings>({
    processingTime: ''
  });
  const [newZone, setNewZone] = useState<ShippingZone>({
    name: '',
    price: 0,
    duration: '',
    active: true,
    order: 0
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    const [zonesData, settingsData] = await Promise.all([
      shippingService.getAll(),
      settingsService.getSettings()
    ]);
    setZones(zonesData);
    if (settingsData) setGlobalSettings(settingsData);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name) return;
    setIsSaving(true);
    try {
      await shippingService.add({ ...newZone, order: zones.length });
      setNewZone({ name: '', price: 0, duration: '', active: true, order: 0 });
      loadZones();
      alert('Zone de livraison ajoutée avec succès !');
    } catch (e: unknown) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : 'Inconnue';
      alert('Erreur lors de l\'ajout de la zone : ' + errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette zone ?')) return;
    await shippingService.delete(id);
    loadZones();
  };

  const toggleActive = async (zone: ShippingZone) => {
    if (!zone.id) return;
    await shippingService.update(zone.id, { active: !zone.active });
    loadZones();
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
        console.log("Données à sauvegarder:", globalSettings);
        await settingsService.updateSettings(globalSettings);
        alert('Informations de l\'entreprise mises à jour avec succès !');
        // Rechargement immédiat pour confirmer
        const freshSettings = await settingsService.getSettings();
        if (freshSettings) setGlobalSettings(freshSettings);
    } catch (err: unknown) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : 'Permission insuffisante';
        alert('Erreur lors de la sauvegarde : ' + errMsg);
    } finally {
        setIsSavingSettings(false);
    }
  };

  const verifyServer = async () => {
    try {
        const data = await settingsService.getSettings();
        alert("Données trouvées sur le serveur : \n" + JSON.stringify(data, null, 2));
    } catch (e: unknown) {
        console.error(e);
        const errMsg = e instanceof Error ? e.message : 'Détails inconnus';
        alert("Erreur de lecture serveur : " + errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => router.push('/admin/materials')}
                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft />
                </button>
                <div>
                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Logistique</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Zones de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Livraison</span></h1>
                </div>
            </div>
        </div>

        <div className="mb-12">
            <Card glass className="p-6 border-orange-500/10 bg-orange-500/5">
                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32">
                        <LogoUpload 
                            onUpload={(url) => setGlobalSettings({...globalSettings, logoUrl: url})} 
                            value={globalSettings.logoUrl}
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-orange-500 mb-1">Identité de votre Marque</h3>
                                <p className="text-sm text-gray-400">Uploadez votre logo ici pour qu&apos;il apparaisse sur tous vos devis proforma et factures.</p>
                            </div>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={verifyServer}
                                className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
                            >
                                Vérifier le serveur
                            </Button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleUpdateSettings}>
                    <div className="flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Temps de traitement général (Production)
                            </label>
                            <Input 
                                placeholder="ex: 3 à 5 jours ouvrés" 
                                className="bg-slate-900/50"
                                value={globalSettings.processingTime}
                                onChange={e => setGlobalSettings({...globalSettings, processingTime: e.target.value})}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                                Adresse de l&apos;entreprise
                            </label>
                            <Input 
                                placeholder="ex: Abidjan, Cocody II Plateaux" 
                                className="bg-slate-900/50"
                                value={globalSettings.address || ''}
                                onChange={e => setGlobalSettings({...globalSettings, address: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Informations Légales (RCCM, IF...)</label>
                            <Input 
                                placeholder="RCCM: CI-ABJ-... / IF: ..." 
                                className="bg-slate-900/50 text-xs"
                                value={globalSettings.legalInfo || ''}
                                onChange={e => setGlobalSettings({...globalSettings, legalInfo: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="md:col-span-4">
                            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Coordonnées Bancaires (RIB)</label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase">Banque</label>
                            <Input 
                                placeholder="ex: NSIA / SIB" 
                                className="bg-slate-900/50 text-xs"
                                value={globalSettings.bankName || ''}
                                onChange={e => setGlobalSettings({...globalSettings, bankName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 font-mono">
                            <label className="text-[10px] font-black text-white/40 uppercase">Numéro Compte</label>
                            <Input 
                                placeholder="000000..." 
                                className="bg-slate-900/50 text-xs"
                                value={globalSettings.accountNumber || ''}
                                onChange={e => setGlobalSettings({...globalSettings, accountNumber: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 font-mono">
                            <label className="text-[10px] font-black text-white/40 uppercase">Code SWIFT</label>
                            <Input 
                                placeholder="BIC / SWIFT" 
                                className="bg-slate-900/50 text-xs"
                                value={globalSettings.swiftCode || ''}
                                onChange={e => setGlobalSettings({...globalSettings, swiftCode: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2 font-mono">
                            <label className="text-[10px] font-black text-white/40 uppercase">IBAN</label>
                            <Input 
                                placeholder="CI00..." 
                                className="bg-slate-900/50 text-xs"
                                value={globalSettings.iban || ''}
                                onChange={e => setGlobalSettings({...globalSettings, iban: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Téléphone</label>
                            <Input 
                                placeholder="+225 ..." 
                                className="bg-slate-900/50"
                                value={globalSettings.phone || ''}
                                onChange={e => setGlobalSettings({...globalSettings, phone: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest text-[#25D366]">WhatsApp</label>
                            <Input 
                                placeholder="+225 ..." 
                                className="bg-slate-900/50"
                                value={globalSettings.whatsapp || ''}
                                onChange={e => setGlobalSettings({...globalSettings, whatsapp: e.target.value})}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button 
                                type="button" 
                                loading={isSavingSettings}
                                icon={<Save />}
                                onClick={() => {
                                    console.log("Tentative de sauvegarde des réglages:", globalSettings);
                                    handleUpdateSettings({ preventDefault: () => {} } as unknown as React.FormEvent);
                                }}
                                className="w-full shadow-xl shadow-orange-600/20"
                            >
                                Enregistrer mon Identité
                            </Button>
                        </div>
                    </div>
                </form>
                <p className="text-[10px] text-orange-300/50 mt-3 italic">
                    Ce délai sera affiché à tous les clients dans leur panier et sur leur devis pour indiquer le temps de fabrication.
                </p>
            </Card>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
                <Card glass className="p-6 border-white/5">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-orange-500" /> Ajouter une zone
                    </h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <Input 
                            label="Nom de la zone" 
                            placeholder="ex: Abidjan Cocody" 
                            value={newZone.name}
                            onChange={e => setNewZone({...newZone, name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Tarif de livraison (FCFA)" 
                            type="number"
                            placeholder="Laisser vide pour gratuit (0)"
                            value={newZone.price === 0 ? '' : newZone.price}
                            onChange={e => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                setNewZone({...newZone, price: val});
                            }}
                        />
                        <Input 
                            label="Délai estimé" 
                            placeholder="ex: 48h-72h ou 3 jours" 
                            icon={<Clock className="w-4 h-4" />}
                            value={newZone.duration || ''}
                            onChange={e => setNewZone({...newZone, duration: e.target.value})}
                        />
                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full" 
                                loading={isSaving}
                                icon={<Save />}
                            >
                                Enregistrer la zone
                            </Button>
                        </div>
                    </form>
                </Card>
                
                <div className="mt-8 p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                    <h5 className="font-bold text-orange-500 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Information
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Les zones configurées ici seront immédiatement disponibles pour les clients dans leur panier. Si le tarif est à 0, la mention <b>&quot;Livraison offerte&quot;</b> sera automatiquement affichée.
                    </p>
                </div>
            </div>

            <div className="lg:col-span-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Chargement des zones</p>
                    </div>
                ) : zones.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {zones.map((zone) => (
                                <motion.div
                                    key={zone.id}
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                                        zone.active ? 'bg-white/5 border-white/10' : 'bg-slate-900/50 border-white/5 opacity-50 grayscale'
                                    }`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                zone.price === 0 ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                                            }`}>
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{zone.name}</h4>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs text-gray-400">
                                                        {zone.price === 0 ? 'Livraison gratuite' : `Frais : ${zone.price.toLocaleString()} FCFA`}
                                                    </p>
                                                    {zone.duration && (
                                                        <span className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full font-bold">
                                                            <Clock className="w-3 h-3" /> {zone.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleActive(zone)}
                                                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                                                    zone.active ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-white/5 border-white/10 text-gray-500'
                                                }`}
                                            >
                                                {zone.active ? 'ACTIF' : 'INACTIF'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(zone.id!)}
                                                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                            >
                                                <Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                        <MapPin className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h4 className="font-bold text-gray-400">Aucune zone de livraison configurée</h4>
                        <p className="text-xs text-gray-600 mt-1">Commencez par ajouter une destination sur la gauche.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
