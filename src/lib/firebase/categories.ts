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
export type { ProductCategory } from '@/lib/pricing/types';

const COLLECTION_NAME = 'categories';

export const categoryService = {
  // Récupérer toutes les catégories actives
  async getAll() {
    if (!db) return [];
    try {
      // On récupère tout et on filtre en mémoire pour éviter les erreurs d'index composite
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      const categories = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() 
      })) as ProductCategory[];

      return categories
        .filter(c => c.active !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Récupérer une catégorie par son slug
  async getBySlug(slug: string) {
    if (!db) return null;
    const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug), where('active', '==', true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0];
    return { 
      id: docData.id, 
      ...docData.data(),
      createdAt: docData.data().createdAt?.toDate() 
    } as ProductCategory;
  },

  // Ajouter une catégorie
  async add(category: Omit<ProductCategory, 'id' | 'createdAt'>) {
    if (!db) throw new Error('Database not initialized');
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...category,
      createdAt: new Date(),
      active: true
    });
  },

  // Mettre à jour
  async update(id: string, data: Partial<ProductCategory>) {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, data);
  },

  // Soft delete
  async delete(id: string) {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, { active: false });
  }
};
