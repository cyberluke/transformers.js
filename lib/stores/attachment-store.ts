import { create } from 'zustand';
import type { Attachment, AttachmentUploadProgress } from '@/types/attachments';

// Čistě state management - žádná business logika
interface AttachmentState {
  // State
  attachments: Attachment[];
  uploadProgress: Record<string, AttachmentUploadProgress>;
  isUploading: boolean;

  // Pure state actions
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  setUploadProgress: (fileId: string, progress: AttachmentUploadProgress) => void;
  removeUploadProgress: (fileId: string) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useAttachmentStore = create<AttachmentState>((set) => ({
  // Initial state
  attachments: [],
  uploadProgress: {},
  isUploading: false,

  // Add attachment (pure state update)
  addAttachment: (attachment: Attachment) => {
    set((state) => ({
      attachments: [...state.attachments, attachment],
    }));
  },

  // Remove attachment (pure state update)
  removeAttachment: (id: string) => {
    set((state) => ({
      attachments: state.attachments.filter((att) => att.id !== id),
    }));
  },

  // Clear all attachments
  clearAttachments: () => {
    set({
      attachments: [],
      uploadProgress: {},
      isUploading: false,
    });
  },

  // Upload progress management
  setUploadProgress: (fileId: string, progress: AttachmentUploadProgress) => {
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: progress,
      },
    }));
  },

  removeUploadProgress: (fileId: string) => {
    set((state) => {
      const newProgress = { ...state.uploadProgress };
      delete newProgress[fileId];
      return { uploadProgress: newProgress };
    });
  },

  setIsUploading: (isUploading: boolean) => {
    set({ isUploading });
  },
})); 