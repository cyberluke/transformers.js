'use client';

import { useRef } from 'react';
import { PaperclipIcon, Loader2 } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import { ALLOWED_FILE_TYPES } from '@/types/attachments';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AttachmentButtonProps {
  disabled?: boolean;
  className?: string;
}

export function AttachmentButton({ disabled = false, className }: AttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, validateFile } = useAttachments();

  // Sestavení accept string pro file input
  const acceptString = Object.entries(ALLOWED_FILE_TYPES)
    .flatMap(([mimeType, extensions]) => [mimeType, ...extensions])
    .join(',');

  const handleButtonClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Klientská validace
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error); // TODO: Nahradit toast notifikací
      return;
    }

    try {
      await uploadFile(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Nepodařilo se nahrát soubor');
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || isUploading}
            className={`rounded-max text-muted-foreground my-2.5 size-8 p-2 transition-opacity ease-in cursor-pointer hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed ${className || ''}`}
            aria-label="Přidat přílohu"
          >
            {isUploading ? (
              <Loader2 className="!size-4.5 animate-spin" />
            ) : (
              <PaperclipIcon className="!size-4.5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          {isUploading ? 'Nahrávám...' : 'Přidat přílohu'}
        </TooltipContent>
      </Tooltip>
    </>
  );
} 