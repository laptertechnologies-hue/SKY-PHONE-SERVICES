const AUTH_HEADER = 'bWFyel8zN0hIbWpPaExzZzFHRGYzOjFlOTV6UkRRUlRsdXJxbk4wcGxBc2dxVlQ5ZzFQNFhH';
const BASE_URL = 'https://wallet.wearemarz.com/api/v1';

export interface PaymentResponse {
  status: string;
  message: string;
  data?: {
    transaction?: {
      uuid: string;
      reference: string;
      status: string;
    };
    redirect_url?: string;
  };
}

export interface VerifyResponse {
  status: string;
  message: string;
  data?: {
    transaction?: {
      uuid: string;
      reference: string;
      status: string; // successful, completed, processing, pending, failed, sandbox
    };
  };
}

/**
 * Robust RFC4122 v4 compliant UUID generator
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Initiates a payment collection (Mobile Money or Card)
 */
export async function initiatePayment(
  amount: number,
  method: 'mobile_money' | 'card',
  reference: string,
  phoneNumber?: string
): Promise<PaymentResponse> {
  const body: any = {
    amount,
    method,
    reference,
    country: 'UG',
    description: 'Sky Phones Order payment',
  };

  if (method === 'mobile_money' && phoneNumber) {
    body.phone_number = phoneNumber;
  }

  const response = await fetch(`${BASE_URL}/collect-money`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${AUTH_HEADER}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Payment initiation failed.');
  }
  return data as PaymentResponse;
}

/**
 * Verifies a payment collection status by uuid
 */
export async function verifyPayment(uuid: string): Promise<VerifyResponse> {
  const response = await fetch(`${BASE_URL}/collect-money/${uuid}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${AUTH_HEADER}`,
    },
  });

  const data = await response.json();
  if (!response.ok || data.status !== 'success') {
    throw new Error(data.message || 'Payment verification failed.');
  }
  return data as VerifyResponse;
}
