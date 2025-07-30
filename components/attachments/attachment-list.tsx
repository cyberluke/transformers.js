'use client';

import { AttachmentItem } from '@/components/attachments/attachment-item';
import { useAttachments } from '@/hooks/useAttachments';
import { Loader2, AlertCircle } from 'lucide-react';

export function AttachmentList() {
  const { attachments, uploadProgress } = useAttachments();
  
  const hasAttachments = attachments.length > 0;
  const hasUploads = Object.keys(uploadProgress).length > 0;

  if (!hasAttachments && !hasUploads) {
    return null;
  }

  return (
    <div className="w-full space-y-2 mt-2">
      {/* Existující attachments */}
      {attachments.map((attachment) => (
        <AttachmentItem key={attachment.id} attachment={attachment} />
      ))}
      
      {/* Upload progress indikátory */}
      {Object.values(uploadProgress).map((progress: any) => (
        <div
          key={progress.fileId}
          className="flex items-center gap-3 p-3 rounded-lg bg-white/30 backdrop-blur-sm border border-gray-200"
        >
          <div className="flex-shrink-0">
            {progress.status === 'uploading' ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : progress.status === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">
              {progress.fileId.split('-')[0]} {/* Zobrazí název souboru */}
            </p>
            
            <p className="text-xs text-gray-500 mt-0.5">
              {progress.status === 'uploading' && 'Nahrávám...'}
              {progress.status === 'success' && 'Nahráno'}
              {progress.status === 'error' && 'Chyba při nahrávání'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 