import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/profile"];

export default function middleware(req: NextRequest) {
  // Zkontrolovat chráněné cesty
  if (protectedRoutes.includes(req.nextUrl.pathname)) {
    // Získat casdoorUser cookie
    const casdoorUserCookie = req.cookies.get("casdoorUser");
    const isAuthenticated = casdoorUserCookie ? true : false;

    // Pokud není autentifikován, přesměrovat na login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Pokud je uživatel na login stránce a už je přihlášený, přesměrovat na profil
  if (req.nextUrl.pathname === "/login") {
    const casdoorUserCookie = req.cookies.get("casdoorUser");
    if (casdoorUserCookie) {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }
}

export const config = {
  matcher: ['/profile', '/login']
}