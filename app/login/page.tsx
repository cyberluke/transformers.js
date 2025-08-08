'use client';

import Sdk from 'casdoor-js-sdk';
import { casdoorConfig } from '@/lib/casdoor-config';

export default function Login() {
  const handleLogin = () => {
    const CasdoorSDK = new Sdk(casdoorConfig);
    CasdoorSDK.signin_redirect();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Přihlášení
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Přihlaste se pomocí Casdoor
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Přihlásit se přes Casdoor
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Ujistěte se, že máte spuštěný Casdoor server na localhost:8000</p>
          <p>a že máte správně nakonfigurovanou aplikaci v Casdoor admin panelu.</p>
        </div>
      </div>
    </div>
  );
}
