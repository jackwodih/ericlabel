'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  Lock
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Navbar } from '@/components/layout/Navbar';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Togo',
    paymentProvider: 'cinetpay'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customization: item.customization
        })),
        total,
        status: 'pending',
        paymentProvider: formData.paymentProvider,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart after success
      clearCart();
      
      // Redirect to success page (or show success state)
      alert(`Commande #${docRef.id.slice(0, 8)} enregistrée ! Redirection vers le paiement...`);
      router.push('/'); 

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Une erreur est survenue lors de la commande.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Navbar />
        <Card glass className="text-center p-12 max-w-md">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
          <Button onClick={() => router.push('/designer')}>Retour au Designer</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30">
      <Navbar />

      <main className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        <div className="mb-12">
          <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour au panier
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight">Finaliser <span className="text-orange-500">ma Commande</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section 1: User Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-xl font-bold border-b border-white/5 pb-4">
                <User className="w-6 h-6 text-orange-500" />
                Informations Personnelles
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  name="name"
                  label="Nom complet" 
                  placeholder="Jean Dupont" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User className="w-4 h-4" />}
                />
                <Input 
                  name="email"
                  label="Email" 
                  type="email" 
                  placeholder="jean@exemple.com" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input 
                  name="phone"
                  label="Téléphone" 
                  placeholder="+228 90 00 00 00" 
                  required 
                  value={formData.phone}
                  onChange={handleInputChange}
                  icon={<Phone className="w-4 h-4" />}
                />
              </div>
            </section>

            {/* Section 2: Shipping */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-xl font-bold border-b border-white/5 pb-4">
                <MapPin className="w-6 h-6 text-orange-500" />
                Adresse de Livraison
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <Input 
                    name="address"
                    label="Adresse (Quartier/Rue)" 
                    placeholder="Quartier Agoè, Rue des Étoiles" 
                    required 
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <Input 
                  name="city"
                  label="Ville" 
                  placeholder="Lomé" 
                  required 
                  value={formData.city}
                  onChange={handleInputChange}
                />
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Pays</label>
                  <select 
                    name="country"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="Togo">Togo</option>
                    <option value="Bénin">Bénin</option>
                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    <option value="Sénégal">Sénégal</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section 3: Payment */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-xl font-bold border-b border-white/5 pb-4">
                <CreditCard className="w-6 h-6 text-orange-500" />
                Mode de Paiement
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'cinetpay', name: 'CinetPay / Mobile Money', desc: 'Orange, MTN, Moov' },
                  { id: 'paydunya', name: 'PayDunya', desc: 'Sénégal & Mali focus' },
                  { id: 'stripe', name: 'Carte Bancaire', desc: 'Visa, Mastercard' },
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentProvider === method.id 
                        ? 'border-orange-500 bg-orange-500/5' 
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentProvider" 
                      value={method.id}
                      checked={formData.paymentProvider === method.id}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className="font-bold text-sm mb-1">{method.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase">{method.desc}</div>
                    {formData.paymentProvider === method.id && (
                      <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-orange-500" />
                    )}
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary UI */}
          <div className="lg:col-span-4 space-y-6">
            <Card glass className="sticky top-32 overflow-hidden">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <ShoppingBag className="w-5 h-5" /> Votre Commande
               </h3>
               <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-3 text-sm border-b border-white/5 pb-4">
                     <div className="w-12 h-12 rounded bg-slate-900 flex-shrink-0 flex items-center justify-center font-bold text-[8px] border border-white/10">
                        {item.customization?.text?.slice(0, 3) || 'LBL'}
                     </div>
                     <div className="flex-1">
                       <p className="font-bold line-clamp-1">{item.name}</p>
                       <p className="text-gray-500 text-xs">Qté: {item.quantity} x {item.unitPrice} FCFA</p>
                     </div>
                     <div className="font-bold">{item.totalPrice.toLocaleString()}</div>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 pt-4 border-t border-white/10 mb-8">
                 <div className="flex justify-between text-gray-400">
                    <span>Sous-total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                 </div>
                 <div className="flex justify-between text-gray-400">
                    <span>Frais de port</span>
                    <span className="text-green-500">Gratuit</span>
                 </div>
                 <div className="flex justify-between text-xl font-black pt-2">
                    <span>Total</span>
                    <span className="text-orange-500">{total.toLocaleString()} FCFA</span>
                 </div>
               </div>

               <Button 
                type="submit"
                className="w-full py-4 text-lg" 
                disabled={isProcessing}
                icon={isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight />}
               >
                 {isProcessing ? 'Traitement...' : 'Confirmer et Payer'}
               </Button>

               <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                 <Lock className="w-3 h-3" />
                 Paiement crypté et sécurisé
               </div>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}

const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);
