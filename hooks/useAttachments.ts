import { useCallback } from 'react';
import { useAttachmentStore } from '@/lib/stores/attachment-store';
import { getAttachmentService } from '@/lib/services/attachmentService';
import { MAX_ATTACHMENTS } from '@/types/attachments';

/**
 * Hook pro práci s attachments - orchestruje service a store
 * Dodržuje SRP: hook se stará o React integraci, deleguje na service a store
 */
export function useAttachments() {
  const {
    attachments,
    uploadProgress,
    isUploading,
    addAttachment: addAttachmentToStore,
    removeAttachment: removeAttachmentFromStore,
    clearAttachments: clearAttachmentsFromStore,
    setUploadProgress,
    removeUploadProgress,
    setIsUploading,
  } = useAttachmentStore();

  const attachmentService = getAttachmentService();

  /**
   * Nahraje soubor - orchestruje service a store
   */
  const uploadFile = useCallback(async (file: File): Promise<void> => {
    // Kontrola limitu attachments
    if (attachments.length >= MAX_ATTACHMENTS) {
      throw new Error(`Můžete přidat maximálně ${MAX_ATTACHMENTS} příloh.`);
    }

    const fileId = `${file.name}-${Date.now()}`;

    try {
      // Nastavení uploading stavu
      setIsUploading(true);
      setUploadProgress(fileId, {
        fileId,
        status: 'uploading',
      });

      // Upload přes service
      const attachment = await attachmentService.uploadFile(file);

      // Přidání do store
      addAttachmentToStore(attachment);

      // Success indikátor
      setUploadProgress(fileId, {
        fileId,
        status: 'success',
      });

      // Cleanup progress po 1 sekundě
      setTimeout(() => {
        removeUploadProgress(fileId);
      }, 1000);

    } catch (error) {
      // Error handling
      setUploadProgress(fileId, {
        fileId,
        status: 'error',
      });

      // Cleanup progress po 3 sekundách
      setTimeout(() => {
        removeUploadProgress(fileId);
      }, 3000);

      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [
    attachments.length,
    setIsUploading,
    setUploadProgress,
    addAttachmentToStore,
    removeUploadProgress,
  ]);

  /**
   * Odstraní attachment ze store
   */
  const removeAttachment = useCallback((id: string) => {
    removeAttachmentFromStore(id);
    // TODO: Volitelně smazat z S3 (batch job nebo při odeslání zprávy)
  }, [removeAttachmentFromStore]);

  /**
   * Vymaže všechny attachments
   */
  const clearAttachments = useCallback(() => {
    clearAttachmentsFromStore();
  }, [clearAttachmentsFromStore]);

  /**
   * Validuje soubor před uploadem
   */
  const validateFile = useCallback((file: File) => {
    return attachmentService.validateFile(file);
  }, []);

  /**
   * Utility funkce delegované na service
   */
  const formatFileSize = useCallback((bytes: number) => {
    return attachmentService.formatFileSize(bytes);
  }, []);

  const isImageFile = useCallback((contentType: string) => {
    return attachmentService.isImageFile(contentType);
  }, []);

  const createImagePreview = useCallback((file: File) => {
    return attachmentService.createImagePreview(file);
  }, []);

  // Return interface
  return {
    // State
    attachments,
    uploadProgress,
    isUploading,
    
    // Actions
    uploadFile,
    removeAttachment,
    clearAttachments,
    
    // Utilities
    validateFile,
    formatFileSize,
    isImageFile,
    createImagePreview,
    
    // Computed
    hasAttachments: attachments.length > 0,
    canAddMore: attachments.length < MAX_ATTACHMENTS,
    attachmentCount: attachments.length,
  };
} 