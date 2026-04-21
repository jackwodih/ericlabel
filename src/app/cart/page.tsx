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
  Maximize2,
  FileText,
  Info,
  MapPin,
  Download,
  Clock
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { shippingService, ShippingZone } from '@/lib/firebase/shipping';
import { settingsService, AppSettings } from '@/lib/firebase/settings';
import { numberToFrench } from '@/lib/utils/numberToWords';

export default function CartPage() {
  const { items, total, removeItem, updateQuantity, itemCount } = useCartStore();
  const [shippingZones, setShippingZones] = React.useState<ShippingZone[]>([]);
  const [shippingZone, setShippingZone] = React.useState<ShippingZone | null>(null);
  const [globalSettings, setGlobalSettings] = React.useState<AppSettings | null>(null);
  const [loadingZones, setLoadingZones] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [zonesData, settingsData] = await Promise.all([
        shippingService.getAll(),
        settingsService.getSettings()
    ]);

    const activeZones = zonesData.filter(z => z.active);
    setShippingZones(activeZones);
    if (activeZones.length > 0) setShippingZone(activeZones[0]);
    if (settingsData) setGlobalSettings(settingsData);
    setLoadingZones(false);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    updateQuantity(itemId, newQty);
  };

  const generatePDFQuote = async () => {
    if (!globalSettings?.address || !globalSettings?.bankName) {
        if (!confirm("Attention : Certains renseignements (Adresse ou Banque) semblent manquants dans votre profil. Voulez-vous quand même générer le devis ?")) return;
    }

    const doc = new jsPDF();
    const orange = [249, 115, 22];
    
    // --- FONCTION POUR CHARGER LE LOGO (Méthode Robuste pour Cloudinary) ---
    const loadImg = async (url: string): Promise<string> => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Échec du chargement Blob, utilisation de l'URL directe", e);
            return url;
        }
    };

    // --- EN-TETE (Logo et Identité) ---
    let titleX = 14;
    const logoSize = 25;
    const logoY = 15;

    // On dessine toujours un cadre discret pour marquer l'emplacement du logo
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineDashPattern([1, 1], 0);
    doc.rect(14, logoY, logoSize, logoSize); // Cadre du logo
    doc.setLineDashPattern([], 0); // Reset dash

    if (globalSettings?.logoUrl) {
        try {
            const imgData = await loadImg(globalSettings.logoUrl);
            doc.addImage(imgData, 'PNG', 14, logoY, logoSize, logoSize);
            titleX = 45; // On décale le titre vers la droite car le logo est là
        } catch (e) {
            console.error("Erreur chargement logo PDF:", e);
            doc.setFontSize(8);
            doc.text('LOGO', 14 + (logoSize/2), logoY + (logoSize/2), { align: 'center' });
            titleX = 45;
        }
    } else {
        // Si pas de logo, on peut laisser le titre à gauche ou laisser le cadre vide
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Votre Logo', 14 + (logoSize/2), logoY + (logoSize/2), { align: 'center' });
        titleX = 45;
    }

    // Logo / Nom entreprise
    doc.setFontSize(24);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('LABEL ERIC', titleX, 32);
    
    // Infos entreprise (à droite)
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    const rightInfoY = 20;
    const rightX = 200;
    doc.text(`${globalSettings?.address || 'Abidjan, Côte d&apos;Ivoire'}`, rightX, rightInfoY, { align: 'right' });
    doc.text(`Tél : ${globalSettings?.phone || '+225 ...'}`, rightX, rightInfoY + 5, { align: 'right' });
    doc.text(`WhatsApp : ${globalSettings?.whatsapp || '+225 ...'}`, rightX, rightInfoY + 10, { align: 'right' });
    if (globalSettings?.legalInfo) {
      doc.text(globalSettings.legalInfo, rightX, rightInfoY + 15, { align: 'right' });
    }

    // --- TITRE DU DOCUMENT ---
    doc.setDrawColor(240);
    doc.line(14, 45, 200, 45);
    
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text('DEVIS PROFORMA', 14, 58);
    
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Référence : PRO-${Date.now().toString().slice(-6)}`, 14, 65);
    doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, 14, 70);

    // --- TABLEAU DES ARTICLES ---
    const tableData = items.map(item => [
      item.name,
      `${item.quantity} pcs`,
      `${(item.unitPrice).toLocaleString()} FCFA`,
      `${item.totalPrice.toLocaleString()} FCFA`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: orange, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // --- RÉCAPITULATIF FINANCIER ---
    // @ts-expect-error - lastAutoTable est injecté par le plugin autotable
    const lastAutoTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable; 
    let finalY = (lastAutoTable?.finalY || 100) + 15;
    const summaryXLabel = 105; // Décalé de 130 à 105 pour éviter les chevauchements
    const summaryXValue = 200;

    doc.setFontSize(11);
    doc.setTextColor(100);
    
    // Sous-total
    doc.text('Sous-total :', summaryXLabel, finalY);
    doc.text(`${total.toLocaleString()} FCFA`, summaryXValue, finalY, { align: 'right' });
    
    // Temps de traitement / Production
    if (globalSettings?.processingTime) {
      finalY += 8;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Temps de production :`, summaryXLabel, finalY);
      doc.text(globalSettings.processingTime, summaryXValue, finalY, { align: 'right' });
    }

    // Livraison
    finalY += 8;
    doc.setFontSize(11);
    doc.setTextColor(100);
    const shippingName = shippingZone?.name || 'Standard';
    const shippingDuration = shippingZone?.duration ? ` (${shippingZone.duration})` : '';
    doc.text(`Livraison ${shippingName}${shippingDuration} :`, summaryXLabel, finalY);
    doc.text(`${(shippingZone?.price || 0).toLocaleString()} FCFA`, summaryXValue, finalY, { align: 'right' });

    // Ligne de séparation finale
    finalY += 5;
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.5);
    doc.line(summaryXLabel, finalY, summaryXValue, finalY);

    // TOTAL FINAL
    finalY += 12;
    doc.setFontSize(14);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GENERAL :', summaryXLabel, finalY);
    const grandTotal = total + (shippingZone?.price || 0);
    doc.text(`${grandTotal.toLocaleString()} FCFA`, summaryXValue, finalY, { align: 'right' });

    // --- MONTANT EN LETTRES ---
    finalY += 15;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'italic');
    doc.text(`Arrêté le présent devis à la somme de : ${numberToFrench(grandTotal)} FCFA`, 14, finalY);

    // --- INFOS DE PAIEMENT & PIED DE PAGE ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(245);
    doc.line(14, pageHeight - 65, 200, pageHeight - 65);
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('COORDONNÉES DE PAIEMENT', 14, pageHeight - 55);
    
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.setFont('helvetica', 'normal');
    
    const bankY = pageHeight - 48;
    if (globalSettings?.bankName) doc.text(`Banque : ${globalSettings.bankName}`, 14, bankY);
    if (globalSettings?.accountNumber) doc.text(`Compte : ${globalSettings.accountNumber}`, 70, bankY);
    if (globalSettings?.swiftCode) doc.text(`SWIFT : ${globalSettings.swiftCode}`, 130, bankY);
    if (globalSettings?.iban) doc.text(`IBAN : ${globalSettings.iban}`, 14, bankY + 6);
    
    doc.setFontSize(8);
    doc.setTextColor(180);
    doc.text('Ce document est une facture proforma générée numériquement. Merci de votre confiance.', 105, pageHeight - 15, { align: 'center' });

    doc.save(`Devis_LabelEric_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />

      <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Mon <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-600">Panier</span>
            </h1>
            <p className="text-gray-400 text-lg">
              {itemCount > 0 
                ? `Vous avez ${items.reduce((acc, item) => acc + item.quantity, 0)} pièces prêtes pour la commande` 
                : "Votre panier est actuellement vide."}
            </p>
          </div>
          <div className="flex gap-4">
            {itemCount > 0 && (
                <Button 
                    variant="outline" 
                    icon={<Download className="w-4 h-4" />}
                    onClick={generatePDFQuote}
                >
                    Télécharger le Devis
                </Button>
            )}
            <Link href="/designer">
                <Button variant="primary" icon={<ChevronLeft className="w-4 h-4" />}>
                Plus d&apos;articles
                </Button>
            </Link>
          </div>
        </div>

        {itemCount > 0 ? (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
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
                      <div className="w-full sm:w-40 aspect-square bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0">
                         <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-rose-500/20" />
                        <div className="relative z-10 text-center font-bold tracking-widest text-[8px] sm:text-[10px]">
                          {item.customization?.text || 'DESIGN'}
                        </div>
                        {item.customization?.images?.[0] && (
                          <div className="absolute z-10 w-2/3 h-2/3">
                            <Image 
                              src={item.customization.images[0]} 
                              alt="Logo" 
                              fill
                              className="object-contain opacity-80" 
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                    {(item as unknown as { categoryName?: string }).categoryName || 'Article'}
                                </span>
                                <span className="text-[10px] text-gray-600 font-mono text-xs">Identifiant unique: {item.id.slice(-12)}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white truncate max-w-full">{item.name}</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 shadow-xl bg-white/5 p-2 rounded-lg">
                              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {(item as unknown as { variantName?: string }).variantName || item.material}</span>
                              <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {item.options.width}x{item.options.height}cm</span>
                              {item.options.technique && <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> {item.options.technique}</span>}
                            </div>
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all flex-shrink-0"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1.5 border border-white/10">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, Math.max(10, item.quantity - 50))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <div className="w-20 text-center">
                                <span className="block text-lg font-black text-white">{item.quantity}</span>
                                <span className="block text-[8px] text-gray-600 uppercase font-bold">Pièces</span>
                            </div>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 50)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 text-orange-500" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Sous-total article</p>
                            <p className="text-xl font-black text-white">{item.totalPrice.toLocaleString()} <span className="text-xs text-gray-500">FCFA</span></p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-4 sticky top-32 space-y-6">
              <Card glass className="border-orange-500/20 shadow-2xl relative">
                <h3 className="text-2xl font-bold mb-6">Récapitulatif</h3>
                
                <div className="space-y-4 mb-8">
                  {globalSettings?.processingTime && (
                    <div className="flex justify-between items-center text-xs text-orange-400 border-b border-orange-500/10 pb-4 italic">
                        <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Temps de traitement</span>
                        <span className="font-bold">{globalSettings.processingTime}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span className="text-white font-black">{total.toLocaleString()} FCFA</span>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Zone de livraison
                    </label>
                    {loadingZones ? (
                        <div className="h-10 bg-white/5 animate-pulse rounded-xl" />
                    ) : (
                        <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none"
                            value={shippingZone?.id || ''}
                            onChange={(e) => {
                                const zone = shippingZones.find(z => z.id === e.target.value);
                                if (zone) setShippingZone(zone);
                            }}
                        >
                            {shippingZones.map(z => (
                                <option key={z.id} value={z.id}>{z.name} - {z.price === 0 ? 'Gratuit' : `${z.price.toLocaleString()} FCFA`}</option>
                            ))}
                        </select>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-gray-400">
                    <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-xs">Estimation livraison <Info className="w-3 h-3" /></span>
                        {shippingZone?.duration && (
                            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Délai : {shippingZone.duration}
                            </span>
                        )}
                    </div>
                    <span className={`font-black ${shippingZone?.price === 0 ? 'text-green-500' : 'text-white'}`}>
                        {shippingZone ? (shippingZone.price === 0 ? 'Offerte' : `${shippingZone.price.toLocaleString()} FCFA`) : '---'}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mb-8 font-black flex justify-between items-end">
                    <span className="text-gray-400 text-sm uppercase">Total final</span>
                    <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">
                        {(total + (shippingZone?.price || 0)).toLocaleString()} FCFA
                    </span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full py-6 text-lg shadow-xl shadow-orange-600/20" icon={<ArrowRight />}>
                    Passer au Checkout
                  </Button>
                </Link>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-8 opacity-40 grayscale">
                    <div className="flex flex-col items-center gap-1">
                        <Truck className="w-6 h-6" />
                        <span className="text-[8px] uppercase font-bold">Express</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="text-[8px] uppercase font-bold">Sécurisé</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <CreditCard className="w-6 h-6" />
                        <span className="text-[8px] uppercase font-bold">Paiement</span>
                    </div>
                </div>
              </Card>

              <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
                <h5 className="font-bold mb-2 flex items-center gap-2 text-orange-400">
                  <FileText className="w-4 h-4" /> Devis Instantané
                </h5>
                <p className="text-xs text-orange-300/70 leading-relaxed mb-4">
                  Besoin d&apos;un document officiel pour votre comptabilité ? Téléchargez votre devis proforma en un clic.
                </p>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-orange-500/30 text-orange-500 hover:bg-orange-500/10"
                    onClick={generatePDFQuote}
                >
                    Générer mon Devis PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-3xl">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Vous n&apos;avez pas encore ajouté de design personnalisé. Allez faire un tour dans notre designer !
            </p>
            <Link href="/designer">
                <Button size="lg" icon={<Sparkles />}>Démarrer une création</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
