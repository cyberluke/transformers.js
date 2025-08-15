import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@/lib/db/actions/sessions';
import type { User } from '@/lib/db/schema/users';
import type { Session } from '@/lib/db/schema/sessions';

/**
 * Helper pro ověření session v API endpointech
 * Vrací user + session data nebo error response
 */
export async function validateSessionForAPI(request: NextRequest): Promise<{
  user: User;
  session: Session;
} | NextResponse> {
  try {
    // Získání session cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    console.log("sessionToken", sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token not found' },
        { status: 401 }
      );
    }

    // Validace session
    const validationResult = await validateSession(sessionToken);

    if (!validationResult.isValid || !validationResult.user || !validationResult.session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    return {
      user: validationResult.user,
      session: validationResult.session
    };

  } catch (error) {
    console.error('❌ Session validation error in API:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Helper pro extrakci pouze userId ze session (pro compatibility)
 */
export async function getUserIdFromAPI(request: NextRequest): Promise<string | NextResponse> {
  const result = await validateSessionForAPI(request);
  
  if (result instanceof NextResponse) {
    return result; // Error response
  }
  
  return result.user.id; // Success - userId
}
