'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sdk from 'casdoor-js-sdk';
import { casdoorClientConfig } from '@/lib/casdoor-config';
import { useFingerprint } from '@/hooks/useFingerprint';

export default function Callback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { fingerprintData, initialize: initializeFingerprint, isLoading: fingerprintLoading } = useFingerprint();

  useEffect(() => {
    // Inicializujeme fingerprint při načtení komponenty
    initializeFingerprint();
  }, [initializeFingerprint]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const CasdoorSDK = new Sdk(casdoorClientConfig);
        
        // Získání access tokenu z URL parametrů
        const tokenResponse = await CasdoorSDK.exchangeForAccessToken();

        console.log('TokenResponse z Casdoor:', tokenResponse);

        // Čekáme na fingerprint data
        if (!fingerprintData) {
          console.log('⏳ Čekám na fingerprint data...');
          return;
        }

        console.log('📱 Fingerprint data připravena:', fingerprintData);

        try {
          const response = await fetch('/api/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Povolí nastavení cookies
            body: JSON.stringify({
              ...tokenResponse,
              fingerprintData
            })
          });

          const result = await response.json();
          console.log('API callback odpověď:', result);

          if (result.success) {
            console.log('✅ Autentifikace úspěšná:', result.user);
            // Přesměrování na hlavní stránku po úspěšné autentifikaci
            router.push('/');
          } else {
            console.error('❌ API endpoint vrátil chybu:', result.error);
            setError(result.error || 'Chyba při autentifikaci');
          }
        } catch (apiError) {
          console.error('❌ Chyba při volání API endpoint:', apiError);
          setError('Chyba komunikace se serverem');
        }

        if (!tokenResponse || !tokenResponse.access_token) {
          setError('Nepodařilo se získat přístupový token');
        }
      } catch (err) {
        console.error('Chyba při zpracování callback:', err);
        setError('Nastala chyba při přihlašování');
      } finally {
        setLoading(false);
      }
    };

    // Spustíme callback handler pouze pokud máme fingerprint data
    if (fingerprintData && !fingerprintLoading) {
      handleCallback();
    }
  }, [router, fingerprintData, fingerprintLoading]);

  if (loading || fingerprintLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Zpracovávám přihlášení...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Chyba při přihlašování</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">Úspěšně přihlášeno!</p>
        </div>
        <p className="mt-4 text-gray-600">Přesměrovávám na profil...</p>
      </div>
    </div>
  );
}
