import sdk from '@/lib/server/casdoor/main';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getUserByCasdoorId, 
  createUser, 
  updateUser,
  createSession,
  generateSessionToken,
  getClientIP,
  getSecureCookieOptions
} from '@/lib/db/actions';
import type { FingerprintData } from '@/lib/services/fingerprintService';

// Typ pro parsovaný JWT token z Casdoor
interface CasdoorJWTPayload {
  sub: string; // user ID
  exp: number; // expiration timestamp
  iss: string; // issuer
  aud: string; // audience
  roles?: Array<{ name: string; [key: string]: any }>;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== CALLBACK AUTH FLOW START ===');
    console.log('Received tokenResponse:', {
      hasAccessToken: !!body.access_token,
      hasRefreshToken: !!body.refresh_token,
      tokenType: body.token_type,
      expiresIn: body.expires_in
    });

    // 1. Parse JWT token z Casdoor
    let parsedToken: CasdoorJWTPayload;
    try {
      parsedToken = sdk.parseJwtToken(body.access_token) as unknown as CasdoorJWTPayload;
      console.log('✅ JWT token úspěšně parsován:', {
        sub: parsedToken.sub,
        exp: parsedToken.exp,
        iss: parsedToken.iss,
        roles: parsedToken.roles?.length || 0
      });
    } catch (error) {
      console.error('❌ Chyba při parsování JWT tokenu:', error);
      return NextResponse.json({
        success: false,
        error: 'Neplatný access token',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 2. Získání fingerprint dat z body
    const fingerprintData: FingerprintData = body.fingerprintData;
    if (!fingerprintData?.visitorId) {
      console.error('❌ Chybí fingerprint data');
      return NextResponse.json({
        success: false,
        error: 'Chybí fingerprint data',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    console.log('📱 Fingerprint data:', {
      visitorId: fingerprintData.visitorId,
      confidence: fingerprintData.confidence
    });

    // 3. Check if user exists
    let user = await getUserByCasdoorId(parsedToken.sub);
    
    if (!user) {
      // 4. Create new user
      console.log('👤 Vytváří se nový uživatel:', parsedToken.sub);
      user = await createUser({
        casdoorId: parsedToken.sub,
        casdoorToken: body.access_token,
        refreshToken: body.refresh_token,
        tokenExpiresAt: new Date(parsedToken.exp * 1000),
        roles: parsedToken.roles?.map((r: any) => ({ name: r.name })) || [],
        tokenBalance: 0 // Default 0 tokenů
      });
      console.log('✅ Nový uživatel vytvořen:', user.id);
    } else {
      // 5. Update existing user
      console.log('👤 Aktualizuje se existující uživatel:', user.id);
      user = await updateUser(user.id, {
        casdoorToken: body.access_token,
        refreshToken: body.refresh_token,
        tokenExpiresAt: new Date(parsedToken.exp * 1000),
        roles: parsedToken.roles?.map((r: any) => ({ name: r.name })) || [],
        lastLoginAt: new Date()
      });
      console.log('✅ Uživatel aktualizován');
    }

    // 6. Create new session
    const sessionToken = generateSessionToken();
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    console.log('🔐 Vytváří se nová session');
    const session = await createSession({
      sessionToken,
      userId: user.id,
      fingerprintId: fingerprintData.visitorId,
      fingerprintData,
      ipAddress: clientIP,
      userAgent
    });

    console.log('✅ Session vytvořena:', {
      sessionId: session.id,
      expiresAt: session.expiresAt
    });

    // 7. Set secure cookie
    const cookieStore = await cookies();
    const cookieOptions = getSecureCookieOptions();
    
    cookieStore.set('session', sessionToken, cookieOptions);
    console.log('🍪 Cookie nastavena s bezpečnými options');

    console.log('=== CALLBACK AUTH FLOW SUCCESS ===');

    return NextResponse.json({
      success: true,
      message: 'Autentifikace úspěšná',
      user: {
        id: user.id,
        casdoorId: user.casdoorId,
        roles: user.roles,
        tokenBalance: user.tokenBalance,
        isActive: user.isActive
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
        fingerprintId: session.fingerprintId
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Kritická chyba v auth flow:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Interní chyba serveru při autentifikaci',
      details: error instanceof Error ? error.message : 'Neznámá chyba',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}