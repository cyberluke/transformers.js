import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/db/actions/sessions';

function isLocalhostRequest(request: NextRequest): boolean {
  const host = request.headers.get('host');
  const origin = request.headers.get('origin');
  const forwardedHost = request.headers.get('x-forwarded-host');
  
  return (
    host?.includes('localhost') ||
    host?.includes('127.0.0.1') ||
    origin?.includes('localhost') ||
    origin?.includes('127.0.0.1') ||
    forwardedHost?.includes('localhost') ||
    forwardedHost?.includes('127.0.0.1') ||
    !origin // Internal server request (no origin header)
  );
}

/**
 * Interní API endpoint pro validaci session
 * Používá middleware pro fetchování, není určený pro externí použití
 */
export async function POST(request: NextRequest) {
  try {
    if (!isLocalhostRequest(request)) {
      console.log('❌ Neautorizovaný request na validate-session');
      return NextResponse.json({ error: 'Unauthorized - internal API only' }, { status: 403 });
    }

    const { sessionToken } = await request.json();
    if (!sessionToken) {
      return NextResponse.json({ isValid: false, error: 'Session token is required' }, { status: 400 });
    }

    console.log('🔍 Validuji session token:', sessionToken.substring(0, 8) + '...');
    const validationResult = await validateSession(sessionToken);

    console.log('✅ Session validation result:', {
      isValid: validationResult.isValid,
      hasSession: !!validationResult.session,
      hasUser: !!validationResult.user
    });

    return NextResponse.json(validationResult);

  } catch (error) {
    console.error('❌ Chyba při validaci session v interním API:', error);
    return NextResponse.json(
      { 
        isValid: false, 
        error: 'Internal validation error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
