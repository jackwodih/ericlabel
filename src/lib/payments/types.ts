export interface PaymentRequest {
  amount: number;
  currency: 'XOF' | 'XAF' | 'USD' | 'EUR';
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  provider: string;
  error?: string;
}

export interface PaymentStatus {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId: string;
  amount: number;
  currency: string;
  provider: string;
  metadata?: any;
}

export type PaymentProvider = 
  | 'cinetpay' 
  | 'paydunya' 
  | 'orange_money' 
  | 'mtn_money' 
  | 'stripe';