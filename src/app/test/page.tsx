'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useCartStore } from '@/store/cartStore';
import { Mail, ShoppingCart, Plus } from 'lucide-react';

export default function TestPage() {
  const [email, setEmail] = useState('');
  const { items, total, addItem, itemCount } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      id: `item-${Date.now()}`,
      productId: 'prod-123',
      name: 'Étiquette Test',
      material: 'similicuir',
      quantity: 1,
      unitPrice: 2000,
      totalPrice: 2000,
      options: {
        width: 10,
        height: 5,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test des Composants
          </h1>
          <p className="text-gray-600">
            Vérification que tout fonctionne correctement
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Boutons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading...</Button>
            <Button icon={<Plus className="w-4 h-4" />}>Avec icône</Button>
          </div>
        </Card>

        {/* Sizes */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Tailles</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card>
          <h2 className="text-2xl font-bold mb-4">Champs de saisie</h2>
          <div className="space-y-4 max-w-md">
            <Input 
              label="Email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
            />
            <Input 
              label="Avec erreur"
              type="text"
              error="Ce champ est requis"
              placeholder="Essayez de taper..."
            />
            <Input 
              label="Désactivé"
              type="text"
              disabled
              placeholder="Champ désactivé"
            />
          </div>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-xl font-bold mb-2">Card Normal</h3>
            <p className="text-gray-600">Une carte simple avec du contenu.</p>
          </Card>
          
          <Card hover>
            <h3 className="text-xl font-bold mb-2">Card Hover</h3>
            <p className="text-gray-600">Passez la souris dessus !</p>
          </Card>
          
          <Card glass>
            <h3 className="text-xl font-bold mb-2">Card Glass</h3>
            <p className="text-gray-600">Effet verre dépoli.</p>
          </Card>

          <Card hover glass>
            <h3 className="text-xl font-bold mb-2">Glass + Hover</h3>
            <p className="text-gray-600">Les deux effets combinés !</p>
          </Card>
        </div>

        {/* Store Zustand (Panier) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Panier (Zustand Store)</h2>
            <div className="flex items-center gap-2 text-orange-600">
              <ShoppingCart className="w-6 h-6" />
              <span className="font-bold">{itemCount} article(s)</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleAddToCart}
              icon={<Plus className="w-4 h-4" />}
            >
              Ajouter un article au panier
            </Button>

            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-orange-600">{item.totalPrice} FCFA</p>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xl font-bold text-right">
                    Total: {total} FCFA
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Le panier est vide
              </p>
            )}
          </div>
        </Card>

        {/* Status */}
        <Card glass>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              ✅ Tous les composants fonctionnent !
            </h3>
            <p className="text-gray-600">
              Vous pouvez maintenant construire l'application complète
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}