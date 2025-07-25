// Supported content types pro Tika zpracování
export const SUPPORTED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/html',
  'application/rtf'
];

// File size limity
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE_MB: 10
} as const;

// Tika server konfigurace
export const TIKA_CONFIG = {
  SERVER_URL: 'https://tika.nanotrik.ai',
  RMETA_ENDPOINT: '/rmeta/form',
  TIMEOUT: 30000 // 30 sekund
} as const; 