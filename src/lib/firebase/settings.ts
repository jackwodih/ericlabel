import { 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { db } from './config';

export interface AppSettings {
  processingTime: string;
  orderPrefix?: string;
  contactEmail?: string;
  address?: string;
  legalInfo?: string;
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
  iban?: string;
  phone?: string;
  whatsapp?: string;
  logoUrl?: string;
  enableDeposit?: boolean;
  depositPercentage?: number;
  moneyFusionUrl?: string;
  moneyFusionSecret?: string;
}

const SETTINGS_DOC_ID = 'identity';
const COLLECTION_NAME = 'shop_config';

export const settingsService = {
  async getSettings() {
    if (!db) return null;
    try {
      const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as AppSettings;
      }
      return { processingTime: '3 à 5 jours ouvrés' }; // Valeur par défaut
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { processingTime: '3 à 5 jours ouvrés' };
    }
  },

  async updateSettings(settings: AppSettings) {
    if (!db) throw new Error("Firebase non initialisé - Vérifiez votre connexion internet.");
    
    // Nettoyage des données (évite d'envoyer des champs undefined qui font parfois planter Firestore)
    const cleanedData = JSON.parse(JSON.stringify(settings));
    
    console.log("Données envoyées à Firestore:", cleanedData);
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    
    try {
      await setDoc(docRef, cleanedData, { merge: true });
      return true;
    } catch (e: unknown) {
      console.error("Erreur Firestore directe:", e);
      throw e;
    }
  }
};
