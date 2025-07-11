'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface Page {
  pageNumber: number;
  content: string;
  paragraphs: string[];
}

interface DocumentMetadata {
  created?: string;
  modified?: string;
  creator?: string;
  producer?: string;
}

interface FileUploadResult {
  fileName: string;
  fileSize: number;
  contentType: string;
  pageCount: number;
  pages: Page[];
  metadata: DocumentMetadata;
  error?: string;
}

interface FileUploadProps {
  onResult?: (result: FileUploadResult | null) => void;
  className?: string;
}

export function FileUpload({ onResult, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<FileUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/tika', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setResult(data);
        onResult?.(data);
      } else {
        setError(data.error || 'Chyba při zpracování souboru');
        onResult?.(null);
      }
    } catch (err) {
      const errorMessage = 'Chyba při uploadu souboru';
      setError(errorMessage);
      onResult?.(null);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  }, [onResult]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setResult(null);
    setError(null);
    onResult?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onResult]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all',
          'hover:border-primary/50 hover:bg-accent/20',
          isDragOver ? 'border-primary bg-accent/30' : 'border-border',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xlsx,.xls,.pptx,.ppt"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          {isUploading ? (
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {isUploading ? 'Zpracovávám soubor...' : 'Přetáhněte soubor sem'}
            </p>
            <p className="text-sm text-muted-foreground">
              nebo klikněte pro výběr souboru
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Podporované formáty: PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX
            </p>
            <p className="text-xs text-muted-foreground">
              Maximální velikost: 10 MB
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center justify-between">
            <p className="text-sm text-destructive font-medium">
              {error}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {result.fileName}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {formatFileSize(result.fileSize)} • {result.pageCount} stránek • {result.contentType}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 