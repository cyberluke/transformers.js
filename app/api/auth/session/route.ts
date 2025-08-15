import { NextRequest, NextResponse } from 'next/server';
import { validateSessionFromCookie } from '@/lib/server/auth/session-middleware';

/**
 * Test endpoint pro ověření session validace
 * GET /api/auth/session
 */
export async function GET(request: NextRequest) {
  console.log('=== SESSION VALIDATION TEST ===');
  
  const result = await validateSessionFromCookie(request);
  
  if (!result.isValid) {
    console.log('❌ Session neplatná');
    return result.error || NextResponse.json(
      { error: 'Session invalid' },
      { status: 401 }
    );
  }

  console.log('✅ Session platná');
  
  return NextResponse.json({
    success: true,
    message: 'Session is valid',
    user: {
      id: result.user?.id,
      casdoorId: result.user?.casdoorId,
      roles: result.user?.roles,
      tokenBalance: result.user?.tokenBalance,
      isActive: result.user?.isActive,
      lastLoginAt: result.user?.lastLoginAt
    },
    session: {
      id: result.session?.id,
      fingerprintId: result.session?.fingerprintId,
      lastUsedAt: result.session?.lastUsedAt,
      expiresAt: result.session?.expiresAt,
      isActive: result.session?.isActive
    },
    timestamp: new Date().toISOString()
  });
}
