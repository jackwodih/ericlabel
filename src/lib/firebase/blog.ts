
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt?: unknown;
}

const COLLECTION_NAME = 'posts';

export const blogService = {
  // Récupérer tous les articles (pour l'admin)
  async getAllPosts() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
  },

  // Récupérer les articles publiés (pour le site public)
  async getPublishedPosts() {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
  },

  // Récupérer un article par son slug
  async getPostBySlug(slug: string) {
    const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
  },

  // Créer un article
  async createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
    return await addDoc(collection(db, COLLECTION_NAME), {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  // Mettre à jour un article
  async updatePost(id: string, post: Partial<BlogPost>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, {
      ...post,
      updatedAt: serverTimestamp(),
    });
  },

  // Supprimer un article
  async deletePost(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(docRef);
  }
};
