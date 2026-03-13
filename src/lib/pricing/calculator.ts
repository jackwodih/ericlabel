import { PricingInput, PricingResult, PricingRule } from './types';

const defaultRules: Record<string, PricingRule> = {
  similicuir: {
    id: 'rule-similicuir',
    material: 'similicuir',
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

export const calculatePrice = (input: PricingInput, providedRule?: PricingRule): PricingResult => {
  const rule = providedRule || defaultRules[input.material] || defaultRules.similicuir;
  
  const area = input.width * input.height;
  const materialPrice = area * (rule.pricePerSqCm || 0);
  const basePrice = rule.basePrice || 0;
  
  let optionsPrice = 0;
  const breakdown: PricingResult['breakdown'] = [
    { label: 'Prix de base matériau', amount: basePrice + materialPrice },
  ];

  // OptionPrices might be undefined in dynamic materials from Firebase
  if (input.options.finish && rule.optionPrices?.finishes) {
    const extra = (rule.optionPrices.finishes as any)[input.options.finish] || 0;
    if (extra > 0) {
      optionsPrice += extra;
      breakdown.push({ label: `Finition: ${input.options.finish}`, amount: extra });
    }
  }

  if (input.options.technique && rule.optionPrices?.techniques) {
    const extra = (rule.optionPrices.techniques as any)[input.options.technique] || 0;
    if (extra > 0) {
      optionsPrice += extra;
      breakdown.push({ label: `Technique: ${input.options.technique}`, amount: extra });
    }
  }

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
    sizePrice: materialPrice, // Simplified
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
