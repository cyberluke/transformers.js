import { NextRequest, NextResponse } from "next/server";

// Public cesty - dostupné bez autentifikace
const publicRoutes = [
  "/login",
  "/callback",
];

// Public API routes - výjimky, které nepotřebují auth
const publicApiRoutes = [
  "/api/callback",  // Auth callback
  "/api/auth/validate-session", // Interní session validace
  "/api/payment/finish",
  // Přidáme další podle potřeby
];

// Public assets a cesty, které se nekontroluji
const publicAssets = [
  "/_next",      // Next.js assets
  "/favicon.ico",
  "/assets",     // Public assets
  "/images",
  "/icons",
  "/robots.txt",
  "/sitemap.xml",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('🔍 Middleware check:', pathname);

  // Skip kontroly pro public assets
  if (publicAssets.some(asset => pathname.startsWith(asset))) {
    console.log('📁 Public asset, skip auth check');
    return NextResponse.next();
  }

  // Skip kontroly pouze pro explicitně povolené API routes
  if (publicApiRoutes.includes(pathname)) {
    console.log('🔧 Public API route, skip auth check');
    return NextResponse.next();
  }

  // Získání session cookie
  const sessionToken = req.cookies.get("session")?.value;
  // Pokud je uživatel na login stránce a má session, přesměrovat domů
  // if (pathname === "/login" && sessionToken) {
  //   console.log('✅ Uživatel s session na login stránce, přesměrování na home');
  //   return NextResponse.redirect(new URL("/", req.url));
  // }
  // TODO: Vyresit handling
  
  // Kontrola pro public routes
  if (publicRoutes.includes(pathname)) {
    console.log('🌐 Public route, pass through');
    return NextResponse.next();
  }

  // DEFAULT: Všechno ostatní vyžaduje autentifikaci
  if (!sessionToken) {
    console.log('❌ Chráněná cesta bez session token, přesměrování na login');
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Validace session tokenu přes interní API (edge runtime compatible)
  try {
    console.log('🔍 Validuji session token přes interní API...');
    
    const validationResponse = await fetch(new URL('/api/auth/validate-session', req.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionToken })
    });

    if (!validationResponse.ok) {
      console.log('❌ Interní API selhalo, přesměrování na login');
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete('session');
      return response;
    }

    const sessionValidation = await validationResponse.json();
    
    if (!sessionValidation.isValid) {
      console.log('❌ Session token neplatný nebo expirovaný, přesměrování na login');
      // Vymazat neplatný cookie
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete('session');
      return response;
    }

    console.log('✅ Session validní pro uživatele:', sessionValidation.user?.id);
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Chyba při validaci session přes API:', error);
    // V případě API chyby také přesměrovat na login
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}