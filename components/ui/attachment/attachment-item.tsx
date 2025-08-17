'use client';

import { X, FileText, Image, File } from 'lucide-react';
import type { Attachment } from '@/types/attachments';
import { useAttachments } from '@/hooks/useAttachments';
import { Button } from '@/components/ui/button';

interface AttachmentItemProps {
  attachment: Attachment;
}



function getFileIcon(contentType: string) {
  if (contentType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (contentType === 'application/pdf' || contentType.includes('document')) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
}



export function AttachmentItem({ attachment }: AttachmentItemProps) {
  const { removeAttachment, formatFileSize, isImageFile } = useAttachments();

  const handleRemove = () => {
    removeAttachment(attachment.id);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/70 transition-colors">
      {/* Preview/Icon */}
      <div className="flex-shrink-0">
        {isImageFile(attachment.contentType) ? (
          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-600">
            {getFileIcon(attachment.contentType)}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {attachment.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(attachment.size)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
        aria-label={`Odstranit ${attachment.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

