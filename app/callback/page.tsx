'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sdk from 'casdoor-js-sdk';
import { casdoorConfig } from '@/lib/casdoor-config';

interface UserInfo {
  name?: string;
  email?: string;
  avatar?: string;
  displayName?: string;
}

export default function Callback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const CasdoorSDK = new Sdk(casdoorConfig);
        
        // Získání access tokenu z URL parametrů
        const tokenResponse = await CasdoorSDK.exchangeForAccessToken();
        
        if (tokenResponse && tokenResponse.access_token) {
          // Získání informací o uživateli
          const userInfo = await CasdoorSDK.getUserInfo(tokenResponse.access_token);
          
          if (userInfo) {
            // Uložení do cookies (alternativně můžete použít localStorage)
            document.cookie = `casdoorUser=${JSON.stringify(userInfo)}; path=/; max-age=86400`; // 24 hodin
            
            setUserInfo(userInfo);
            
            // Přesměrování na chráněnou stránku po úspěšném přihlášení
            setTimeout(() => {
              router.push('/profile');
            }, 2000);
          } else {
            setError('Nepodařilo se získat informace o uživateli');
          }
        } else {
          setError('Nepodařilo se získat přístupový token');
        }
      } catch (err) {
        console.error('Chyba při zpracování callback:', err);
        setError('Nastala chyba při přihlašování');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router]);

  if (loading) {
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
          {userInfo && (
            <div className="mt-2">
              <p>Vítejte, {userInfo.displayName || userInfo.name || 'uživateli'}!</p>
              {userInfo.email && <p className="text-sm">Email: {userInfo.email}</p>}
            </div>
          )}
        </div>
        <p className="mt-4 text-gray-600">Přesměrovávám na profil...</p>
      </div>
    </div>
  );
}
