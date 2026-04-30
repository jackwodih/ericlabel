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

import { ProductType, PricingRule } from '@/lib/pricing/types';

export interface CustomizationConfig {
  enableDimensions: boolean;
  enableMaterialColor: boolean;
  enableText: boolean;
  enableMarkingColor: boolean;
  enableFonts: boolean;
  enableLogo: boolean;
}

export interface Material {
  id?: string;
  name: string;
  description: string;
  categoryId?: string; // Lien vers la catégorie dynamique
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
  shape?: 'rectangle' | 'rounded' | 'circle' | 'oval' | 'square';
  defaultWidth?: number;
  defaultHeight?: number;
  variants?: MaterialVariant[];
  discounts?: DiscountTier[];
  customization?: CustomizationConfig;
}

export interface DiscountTier {
  quantity: number;
  discountPercentage: number;
}

export interface MaterialVariant {
  id: string;
  name: string;
  description?: string;
  color: string;
  textureUrl?: string;
  pricePerUnit?: number;
  pricePerSqCm?: number;
  pricePerCm3?: number;
  basePrice?: number;
}

const COLLECTION_NAME = 'materials';

export const materialService = {
  // Récupérer tous les matériaux actifs
  async getAll() {
    if (!db) return [];
    const q = query(collection(db, COLLECTION_NAME), where('active', '==', true));
    const snapshot = await getDocs(q);
    const defaults = {
      enableDimensions: true,
      enableMaterialColor: true,
      enableText: true,
      enableMarkingColor: true,
      enableFonts: true,
      enableLogo: true
    };

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Valeurs par défaut pour l'évolutivité
        productType: data.productType || 'label',
        pricingModel: data.pricingModel || 'surface',
        customization: {
          ...defaults,
          ...(data.customization || {})
        }
      };
    }) as Material[];
  },

  // Récupérer les matériaux par catégorie
  async getByCategory(categoryId: string) {
    if (!db) return [];
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('active', '==', true),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Material[];
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
