export interface Attachment {
  id: string;
  name: string;
  contentType: string;
  url: string;
  size: number;
  uploadedAt: Date;
  key: string; // S3 key pro případné mazání
}

export interface AttachmentUploadResponse {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}

export interface AttachmentUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

// Povolené typy souborů
export const ALLOWED_FILE_TYPES = {
  // Obrázky
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  // Dokumenty
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENTS = 5; // Maximální počet attachments na zprávu

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES;

export function isAllowedFileType(type: string): type is AllowedMimeType {
  return type in ALLOWED_FILE_TYPES;
}

export function getFileExtensions(type: AllowedMimeType): readonly string[] {
  return ALLOWED_FILE_TYPES[type];
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Soubor je příliš velký. Maximální velikost je ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }
  
  if (!isAllowedFileType(file.type)) {
    return { valid: false, error: 'Nepodporovaný typ souboru.' };
  }
  
  return { valid: true };
} 