export interface PricingInput {
  material: 'similicuir' | 'satin' | 'tisse' | 'metal' | 'acrylique';
  width: number;
  height: number;
  quantity: number;
  options: {
    colors?: number;
    customText?: boolean;
    customImage?: boolean;
    finish?: 'standard' | 'premium' | 'luxury';
    technique?: 'print' | 'embroidery' | 'engraving' | 'uv' | 'weaving';
    express?: boolean;
    preview3D?: boolean;
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
  basePrice: number;
  pricePerSqCm: number;
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
    finishes?: {
      standard: number;
      premium: number;
      luxury: number;
    };
    techniques?: {
      print?: number;
      embroidery?: number;
      engraving?: number;
      uv?: number;
      weaving?: number;
    };
    express?: number;
    preview3D?: number;
  };
  taxRate: number;
  active: boolean;
}