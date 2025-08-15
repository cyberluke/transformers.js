import { randomBytes } from 'crypto';

// === CONSTANTS ===

export const SESSION_TTL_DAYS = 7;
export const SESSION_REFRESH_THRESHOLD_MINUTES = 30;

// === UTILITY FUNCTIONS ===

/**
 * Generuje bezpečný náhodný session token
 */
export const generateSessionToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Vypočítá datum expirace na základě počtu dní
 */
export const calculateExpirationDate = (days: number): Date => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

/**
 * Kontroluje, zda je čas v rámci refresh threshold
 */
export const isWithinRefreshThreshold = (lastUsed: Date, thresholdMinutes: number): boolean => {
  const now = new Date();
  const timeDifference = now.getTime() - lastUsed.getTime();
  const thresholdMs = thresholdMinutes * 60 * 1000;
  
  return timeDifference <= thresholdMs;
};

/**
 * Získá IP adresu z request objektu (Next.js Request)
 */
export const getClientIP = (request: Request): string => {
  // Zkusí získat IP z různých headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback pro development
  return '127.0.0.1';
};

/**
 * Vytvoří bezpečné cookie options pro session
 */
export const getSecureCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(isProduction);
  
  return {
    httpOnly: true,
    secure: isProduction, // HTTPS pouze v produkci
    sameSite: 'lax' as const, // 'lax' je kompatibilnější než 'strict'
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60, // v sekundách
  };
};

/**
 * Validuje, zda je token dostatečně silný
 */
export const isValidSessionToken = (token: string): boolean => {
  // Kontrola délky (64 hex znaků = 32 bytes)
  if (token.length !== 64) {
    return false;
  }

  // Kontrola, že obsahuje pouze hex znaky
  const hexRegex = /^[a-f0-9]+$/i;
  return hexRegex.test(token);
};

/**
 * Formátuje fingerprint data pro bezpečné ukládání
 */
export const sanitizeFingerprintData = (fingerprintData: any): any => {
  // Odstraní citlivé informace, pokud existují
  const sanitized = { ...fingerprintData };
  
  // Můžeme přidat logic pro odstranění specifických polí
  // delete sanitized.sensitiveField;
  
  return sanitized;
};
