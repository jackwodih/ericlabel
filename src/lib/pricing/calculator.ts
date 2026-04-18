import { PricingInput, PricingResult, PricingRule } from './types';

const defaultRules: Record<string, PricingRule> = {
  similicuir: {
    id: 'rule-similicuir',
    material: 'similicuir',
    productType: 'label',
    pricingModel: 'surface',
    basePrice: 500,
    pricePerSqCm: 150,
    minimumPrice: 1000,
    sizeBreaks: [],
    quantityBreaks: [
      { min: 50, max: 99, discount: 0.1 },
      { min: 100, max: 499, discount: 0.2 },
      { min: 500, max: 10000, discount: 0.35 },
    ],
    optionPrices: {
      finishes: { standard: 0, premium: 200, luxury: 500 },
      techniques: { print: 0, engraving: 300 },
    },
    taxRate: 0.18,
    active: true,
  },
  satin: {
    id: 'rule-satin',
    material: 'satin',
    productType: 'label',
    pricingModel: 'surface',
    basePrice: 300,
    pricePerSqCm: 50,
    minimumPrice: 500,
    sizeBreaks: [],
    quantityBreaks: [
      { min: 100, max: 499, discount: 0.15 },
      { min: 500, max: 10000, discount: 0.3 },
    ],
    optionPrices: {
      finishes: { standard: 0, premium: 100, luxury: 300 },
      techniques: { print: 0, weaving: 200 },
    },
    taxRate: 0.18,
    active: true,
  },
  tisse: {
    id: 'rule-tisse',
    material: 'tissé',
    productType: 'label',
    pricingModel: 'surface',
    basePrice: 400,
    pricePerSqCm: 80,
    minimumPrice: 800,
    sizeBreaks: [],
    quantityBreaks: [
      { min: 100, max: 499, discount: 0.2 },
      { min: 500, max: 10000, discount: 0.4 },
    ],
    optionPrices: {
      finishes: { standard: 0, premium: 150, luxury: 400 },
      techniques: { weaving: 0 },
    },
    taxRate: 0.18,
    active: true,
  }
};

export const calculatePrice = (input: PricingInput, rule: PricingRule): PricingResult => {
  let materialPrice = 0;
  const basePrice = rule.basePrice || 0;
  
  // 1. Calcul de la composante matérielle selon le modèle
  switch (rule.pricingModel) {
    case 'surface':
      const area = (input.width || 0) * (input.height || 0);
      materialPrice = area * (rule.pricePerSqCm || 0);
      break;
    case 'volume':
      const volume = (input.width || 0) * (input.height || 0) * (input.depth || 0);
      materialPrice = volume * (rule.pricePerCm3 || 0);
      break;
    case 'unit':
      materialPrice = rule.pricePerUnit || 0;
      break;
    default:
      materialPrice = 0;
  }
  
  let optionsPrice = 0;
  const breakdown: PricingResult['breakdown'] = [
    { label: 'Prix de base matériau', amount: basePrice + materialPrice },
  ];

  // 2. Calcul des options
  if (input.options.finish && rule.optionPrices?.finishes) {
    const extra = rule.optionPrices.finishes[input.options.finish] || 0;
    if (extra > 0) {
      optionsPrice += extra;
      breakdown.push({ label: `Finition: ${input.options.finish}`, amount: extra });
    }
  }

  if (input.options.technique && rule.optionPrices?.techniques) {
    const extra = rule.optionPrices.techniques[input.options.technique] || 0;
    if (extra > 0) {
      optionsPrice += extra;
      breakdown.push({ label: `Technique: ${input.options.technique}`, amount: extra });
    }
  }

  // 3. Sous-total et Remises sur quantité
  const subtotalBeforeDiscount = (basePrice + materialPrice + optionsPrice) * input.quantity;
  
  let discount = 0;
  const quantityBreaks = rule.quantityBreaks || [];
  const qBreak = quantityBreaks.find(b => input.quantity >= b.min && input.quantity <= b.max);
  if (qBreak) {
    discount = subtotalBeforeDiscount * qBreak.discount;
    breakdown.push({ label: `Remise quantité (${qBreak.discount * 100}%)`, amount: -discount });
  }

  const subtotal = subtotalBeforeDiscount - discount;
  const tax = subtotal * (rule.taxRate || 0);
  const total = subtotal + tax;

  return {
    basePrice,
    materialPrice,
    sizePrice: materialPrice,
    optionsPrice,
    quantityDiscount: discount,
    subtotal,
    tax,
    processingFee: 0,
    total: Math.max(total, rule.minimumPrice || 0),
    currency: 'FCFA',
    breakdown
  };
};

// Export fallback generator for when rule is missing
export const getDefaultRule = (materialIdOrName: string): PricingRule => {
  return defaultRules[materialIdOrName] || defaultRules.similicuir;
};
