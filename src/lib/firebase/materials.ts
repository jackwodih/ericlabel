import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './config';

export interface Material {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  pricePerSqCm: number;
  textureUrl?: string; // Image de texture Cloudinary
  color1: string; // Pour le dégradé fallback
  color2: string; // Pour le dégradé fallback
  techniques: string[];
  active: boolean;
  createdAt?: any;
}

const COLLECTION_NAME = 'materials';

export const materialService = {
  // Récupérer tous les matériaux actifs
  async getAll() {
    const q = query(collection(db, COLLECTION_NAME), where('active', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Material[];
  },

  // Ajouter un nouveau matériau
  async add(material: Material) {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...material,
      createdAt: new Date()
    });
  },

  // Mettre à jour
  async update(id: string, data: Partial<Material>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, data);
  },

  // Supprimer (soft delete recommandé)
  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, { active: false });
  }
};
