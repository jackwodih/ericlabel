// Types pour les produits
export interface Product {
  id: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  material: 'similicuir' | 'satin' | 'tisse' | 'metal' | 'acrylique';
  category: string;
  basePrice: number;
  images: string[];
  options: {
    colors?: string[];
    sizes?: { width: number; height: number; price: number }[];
    finishes?: { name: string; price: number }[];
  };
  active: boolean;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les commandes
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: 'XOF';
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentProvider: string;
  paymentId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  customerInfo: {
    email: string;
    phone: string;
    name: string;
  };
  locale: 'fr' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  customization?: {
    text?: string;
    images?: string[];
    colors?: string[];
    design?: any;
  };
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

// Types pour les utilisateurs
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'admin' | 'production';
  locale: 'fr' | 'en';
  addresses: Address[];
  savedDesigns: string[];
  orderHistory: string[];
  createdAt: Date;
}