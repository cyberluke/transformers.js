'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  name?: string;
  email?: string;
  avatar?: string;
  displayName?: string;
  phone?: string;
  organization?: string;
}

export default function Profile() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Načíst uživatelské informace z cookies
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('casdoorUser='))
      ?.split('=')[1];

    if (cookieValue) {
      try {
        const user = JSON.parse(decodeURIComponent(cookieValue));
        setUserInfo(user);
      } catch (error) {
        console.error('Chyba při parsování uživatelských dat:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    // Smazat cookie
    document.cookie = 'casdoorUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Přesměrovat na login
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Můj profil</h1>
          </div>
          
          <div className="px-6 py-8">
            {userInfo ? (
              <div className="space-y-6">
                {/* Avatar sekce */}
                <div className="flex items-center space-x-4">
                  {userInfo.avatar ? (
                    <img
                      src={userInfo.avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-indigo-600">
                        {(userInfo.displayName || userInfo.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {userInfo.displayName || userInfo.name || 'Uživatel'}
                    </h2>
                    {userInfo.email && (
                      <p className="text-gray-600">{userInfo.email}</p>
                    )}
                  </div>
                </div>

                {/* Informace o uživateli */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informace o účtu
                  </h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {userInfo.name && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Jméno</dt>
                        <dd className="mt-1 text-sm text-gray-900">{userInfo.name}</dd>
                      </div>
                    )}
                    {userInfo.email && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{userInfo.email}</dd>
                      </div>
                    )}
                    {userInfo.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                        <dd className="mt-1 text-sm text-gray-900">{userInfo.phone}</dd>
                      </div>
                    )}
                    {userInfo.organization && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Organizace</dt>
                        <dd className="mt-1 text-sm text-gray-900">{userInfo.organization}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Akce */}
                <div className="border-t pt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  >
                    Odhlásit se
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">Nepodařilo se načíst informace o uživateli.</p>
                <button
                  onClick={handleLogout}
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Přihlásit se znovu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
