
export interface MoneyFusionPaymentRequest {
  amount: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  returnUrl: string;
  webhookUrl: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export const moneyFusionService = {
  async initiatePayment(data: MoneyFusionPaymentRequest) {
    try {
      // On passe par notre propre API pour ne pas exposer la clé privée au client
      const response = await fetch('/api/payments/moneyfusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'initiation du paiement');
      }

      const result = await response.json();
      
      // Money Fusion renvoie généralement un URL de redirection ou un Token
      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
      
      return result;
    } catch (error) {
      console.error('Money Fusion Service Error:', error);
      throw error;
    }
  }
};
