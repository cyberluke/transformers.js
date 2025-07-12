import { NextResponse } from 'next/server';
import client from './client';

/**
 * Validuje fingerprint a vrací userId
 * @param fingerprint - Fingerprint string z query parametrů
 * @returns Promise<{ userId: string | null, error: NextResponse | null }>
 */
export async function validateFingerprint(fingerprint: string | null): Promise<{
  userId: string | null;
  error: NextResponse | null;
}> {
  // Zkontrolovat že fingerprint existuje
  if (!fingerprint) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'Fingerprint is required' }, { status: 400 })
    };
  }

  // Získání userId z fingerprint
  let userId = null;
  try {
    const fingerprintData = await client.getEvent(fingerprint);
    userId = fingerprintData.products.identification?.data?.visitorId;
  } catch (error) {
    console.error('Fingerprint error:', error);
    return {
      userId: null,
      error: NextResponse.json({ error: 'Invalid fingerprint' }, { status: 401 })
    };
  }

  // Zkontrolovat že userId existuje
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    };
  }

  return {
    userId,
    error: null
  };
}

 