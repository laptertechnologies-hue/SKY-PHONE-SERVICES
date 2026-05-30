const API_KEY = (import.meta.env.VITE_MAZPAY_API_KEY as string) || 'marz_37HHmjOhLsg1GDf3';
const AUTH_HEADER = (import.meta.env.VITE_MAZPAY_AUTH_HEADER as string) || 'bWFyel8zN0hIbWpPaExzZzFHRGYzOjFlOTV6UkRRUlRsdXJxbk4wcGxBc2dxVlQ5ZzFQNFhH';
const BASE_URL = 'https://api.marzpay.com/v1';

export interface PaymentResponse {
  transaction_id: string;
  status: string;
  message: string;
}

export async function initiatePayment(
  amount: number,
  phoneNumber: string,
  reference: string
): Promise<PaymentResponse> {
  const response = await fetch(`${BASE_URL}/collections/mobile-money`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${AUTH_HEADER}`,
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({
      amount,
      phone_number: phoneNumber,
      reference,
      currency: 'UGX',
      description: 'Sky Phone Services order',
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Payment initiation failed');
  return data as PaymentResponse;
}

export async function verifyPayment(transactionId: string): Promise<PaymentResponse> {
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
      'X-API-Key': API_KEY,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Payment verification failed');
  return data as PaymentResponse;
}
