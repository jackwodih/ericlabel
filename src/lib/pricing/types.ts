export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  pricingModel: 'surface' | 'unit' | 'volume';
  previewType: 'rectangle' | 'circle' | 'square' | 'template';
  icon?: string; // Nom de l'icône Lucide
  active: boolean;
  createdAt: Date;
  order: number;
}

export type ProductType = string;

export interface PricingInput {
  productType: ProductType;
  material: string;
  // Dimensions flexibles
  width?: number;
  height?: number;
  depth?: number;
  diameter?: number;
  variantId?: string;
  
  quantity: number;
  options: {
    colors?: number;
    customText?: boolean;
    customImage?: boolean;
    finish?: 'standard' | 'premium' | 'luxury';
    technique?: string;
    express?: boolean;
    preview3D?: boolean;
  };
  logoSettings?: {
    x: number;
    y: number;
    scale: number;
    blendMode: 'normal' | 'multiply';
  };
  textSettings?: {
    x: number;
    y: number;
    scale: number;
  };
  locale?: 'fr' | 'en';
}

export interface PricingResult {
  basePrice: number;
  materialPrice: number;
  sizePrice: number;
  optionsPrice: number;
  quantityDiscount: number;
  subtotal: number;
  tax: number;
  processingFee: number;
  total: number;
  currency: string;
  breakdown: {
    label: string;
    amount: number;
    description?: string;
  }[];
}

export interface PricingRule {
  id: string;
  material: string;
  productType: ProductType;
  pricingModel: 'surface' | 'unit' | 'volume';
  
  basePrice: number;
  pricePerSqCm?: number; // Pour 'surface'
  pricePerUnit?: number; // Pour 'unit'
  pricePerCm3?: number;  // Pour 'volume'
  
  minimumPrice: number;
  sizeBreaks: {
    minSize: number;
    maxSize: number;
    priceMultiplier: number;
  }[];
  quantityBreaks: {
    min: number;
    max: number;
    discount: number;
  }[];
  optionPrices: {
    colorExtra?: number;
    customText?: number;
    customImage?: number;
    finishes?: Record<string, number>;
    techniques?: Record<string, number>;
    express?: number;
    preview3D?: number;
  };
  variants?: any[];
  taxRate: number;
  active: boolean;
}