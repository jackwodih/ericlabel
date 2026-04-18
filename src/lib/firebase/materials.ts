import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './config';

import { ProductType, PricingRule } from './pricing/types';

export interface Material {
  id?: string;
  name: string;
  description: string;
  productType: ProductType;
  pricingModel: 'surface' | 'unit' | 'volume';
  basePrice: number;
  pricePerSqCm?: number;
  pricePerUnit?: number;
  pricePerCm3?: number;
  textureUrl?: string;
  color1: string;
  color2: string;
  techniques: string[];
  active: boolean;
  createdAt?: Date;
  optionPrices?: PricingRule['optionPrices']; 
  quantityBreaks?: PricingRule['quantityBreaks'];
  taxRate?: number;
  minimumPrice?: number;
}

const COLLECTION_NAME = 'materials';

export const materialService = {
  // Récupérer tous les matériaux actifs
  async getAll() {
    if (!db) return [];
    const q = query(collection(db, COLLECTION_NAME), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Valeurs par défaut pour l'évolutivité
        productType: data.productType || 'label',
        pricingModel: data.pricingModel || 'surface',
      };
    }) as Material[];
  },

  // Ajouter un nouveau matériau
  async add(material: Material) {
    if (!db) throw new Error('Database not initialized');
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...material,
      createdAt: new Date()
    });
  },

  // Mettre à jour
  async update(id: string, data: Partial<Material>) {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, data);
  },

  // Supprimer (soft delete recommandé)
  async delete(id: string) {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, { active: false });
  }
};
