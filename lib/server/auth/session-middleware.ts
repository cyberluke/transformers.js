import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/db/actions/sessions';
import type { User } from '@/lib/db/schema/users';
import type { Session } from '@/lib/db/schema/sessions';

/**
 * Výsledek session validace
 */
export interface SessionValidationResult {
  isValid: boolean;
  user?: User;
  session?: Session;
  error?: NextResponse;
}

/**
 * Validuje session z cookie
 * Pouze kontroluje platnost, neobnovuje TTL
 */
export async function validateSessionFromCookie(request: NextRequest): Promise<SessionValidationResult> {
  try {
    // Získání session token z cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return {
        isValid: false,
        error: NextResponse.json(
          { error: 'Session token not found' },
          { status: 401 }
        )
      };
    }

    console.log('🔍 Validuji session token:', sessionToken.substring(0, 8) + '...');

    // Validace session přes DB
    const validationResult = await validateSession(sessionToken);

    if (!validationResult.isValid) {
      console.log('❌ Session neplatná nebo expirovaná');
      return {
        isValid: false,
        error: NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        )
      };
    }

    console.log('✅ Session platná pro uživatele:', validationResult.user?.id);

    return {
      isValid: true,
      user: validationResult.user,
      session: validationResult.session
    };

  } catch (error) {
    console.error('❌ Chyba při validaci session:', error);
    return {
      isValid: false,
      error: NextResponse.json(
        { error: 'Session validation failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware helper pro rychlé použití v API routes
 * Vrací buď error response nebo null (pokud je vše OK)
 */
export async function requireValidSession(request: NextRequest): Promise<{
  user: User;
  session: Session;
} | NextResponse> {
  const result = await validateSessionFromCookie(request);
  
  if (!result.isValid || result.error) {
    return result.error!;
  }

  return {
    user: result.user!,
    session: result.session!
  };
}

/**
 * Jednoduchý helper pro extrakci user ID ze session
 */
export async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  const result = await validateSessionFromCookie(request);
  return result.isValid ? result.user?.id || null : null;
}
