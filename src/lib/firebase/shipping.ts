import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './config';

export interface ShippingZone {
  id?: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
  active: boolean;
  order: number;
}

const COLLECTION_NAME = 'shipping_zones';

export const shippingService = {
  async getAll() {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShippingZone[];
    } catch (error) {
      console.error('Error fetching shipping zones:', error);
      return [];
    }
  },

  async add(zone: ShippingZone) {
    if (!db) return null;
    return addDoc(collection(db, COLLECTION_NAME), zone);
  },

  async update(id: string, zone: Partial<ShippingZone>) {
    if (!db) return;
    const docRef = doc(db, COLLECTION_NAME, id);
    return updateDoc(docRef, zone);
  },

  async delete(id: string) {
    if (!db) return;
    const docRef = doc(db, COLLECTION_NAME, id);
    return deleteDoc(docRef);
  }
};
