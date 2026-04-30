
import { NextResponse } from 'next/server';
import { settingsService } from '@/lib/firebase/settings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, orderId, customerName, customerPhone, returnUrl, webhookUrl, items } = body;

    // On récupère les réglages depuis Firestore
    const settings = await settingsService.getSettings();
    
    const privateKey = settings?.moneyFusionSecret || process.env.MONEYFUSION_API_KEY;
    const apiUrl = settings?.moneyFusionUrl || 'https://www.pay.moneyfusion.net/schoolhub_Togo/3cc9830d6a33850d/pay/';

    if (!privateKey) {
      return NextResponse.json({ message: 'Configuration de paiement manquante (API KEY)' }, { status: 500 });
    }

    // Formatage selon les exigences de Money Fusion
    const moneyFusionData = {
      totalPrice: amount,
      article: items.map((item: { name: string; price: number; quantity: number }) => ({
        nom: item.name,
        montant: item.price * item.quantity
      })),
      personal_Info: [
        {
          userId: customerPhone, // On utilise le téléphone comme ID utilisateur par défaut
          orderId: orderId
        }
      ],
      nomclient: customerName,
      numeroSend: customerPhone,
      return_url: returnUrl,
      webhook_url: webhookUrl
    };

    console.log("Envoi à Money Fusion (URL Dynamique):", apiUrl);

    // Utilisation de l'URL configurée dans l'admin
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'moneyfusion-private-key': privateKey || ''
      },
      body: JSON.stringify(moneyFusionData)
    });

    const result = await response.json();
    console.log("Réponse Money Fusion:", result);

    if (result.status === 'success' || result.payment_url || result.url) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ 
        message: result.message || 'Le service Money Fusion a refusé la transaction. Vérifiez vos clés et votre IP.',
        details: result 
      }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('API MoneyFusion Error:', error);
    const message = error instanceof Error ? error.message : 'Erreur serveur interne';
    return NextResponse.json({ message }, { status: 500 });
  }
}
