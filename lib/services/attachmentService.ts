import type { Attachment, AttachmentUploadResponse } from '@/types/attachments';
import { validateFile } from '@/types/attachments';
import { ulid } from 'ulid';

export interface UploadProgressCallback {
  (progress: number): void;
}

export class AttachmentService {
  private static instance: AttachmentService;
  
  private constructor() {}
  
  static getInstance(): AttachmentService {
    if (!AttachmentService.instance) {
      AttachmentService.instance = new AttachmentService();
    }
    return AttachmentService.instance;
  }

  /**
   * Nahraje soubor na server a vrátí Attachment objekt
   */
  async uploadFile(
    file: File, 
    onProgress?: UploadProgressCallback
  ): Promise<Attachment> {
    // Klientská validace
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Simulace progress pro lepší UX
    const progressInterval = onProgress ? setInterval(() => {
      onProgress(Math.random() * 90); // Random progress do 90%
    }, 100) : null;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: AttachmentUploadResponse = await response.json();

      if (!result.success || !result.attachment) {
        throw new Error(result.error || 'Upload failed');
      }

      // Dokončení progress
      if (onProgress) {
        onProgress(100);
      }

      return result.attachment;

    } catch (error) {
      throw error instanceof Error ? error : new Error('Neočekávaná chyba při uploadu');
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }

  /**
   * Validuje soubor před uploadem
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    return validateFile(file);
  }

  /**
   * Generuje jedinečné ID pro attachment
   */
  generateId(): string {
    return ulid();
  }

  /**
   * Formatuje velikost souboru pro zobrazení
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Zkontroluje, zda je soubor obrázek
   */
  isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  /**
   * Vytvoří URL pro preview obrázku
   */
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Default instance getter
export const getAttachmentService = (): AttachmentService => {
  return AttachmentService.getInstance();
}; 