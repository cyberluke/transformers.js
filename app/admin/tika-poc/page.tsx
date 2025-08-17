'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/input';
import { GlassmorphicButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/layout';
import { Separator } from '@/components/ui/layout';
import { ArrowLeft, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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

export default function TikaPocPage() {
  const [result, setResult] = useState<FileUploadResult | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleDownloadText = () => {
    if (!result) return;

    const fullText = result.pages
      .map((page) => `--- Stránka ${page.pageNumber} ---\n\n${page.content}`)
      .join('\n\n\n');
    
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-${result.fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage: number) => {
    if (result && newPage >= 0 && newPage < result.pageCount) {
      setCurrentPage(newPage);
    }
  };

  // Reset current page when new result comes in
  const handleResult = (newResult: FileUploadResult | null) => {
    setResult(newResult);
    setCurrentPage(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <GlassmorphicButton variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět na hlavní stránku
              </GlassmorphicButton>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Apache Tika PoC
              </h1>
              <p className="text-muted-foreground">
                Proof of Concept pro extrakci textu ze souborů
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="p-6 mb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
          <div className="flex items-start space-x-4">
            <FileText className="h-6 w-6 text-primary mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Jak to funguje</h2>
              <p className="text-muted-foreground mb-3">
                Nahrajte soubor (PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX) 
                a Apache Tika automaticky extrahuje veškerý textový obsah.
              </p>
              <div className="text-sm text-muted-foreground">
                <strong>Proces:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Soubor se nahraje na náš server</li>
                  <li>Server pošle soubor na <code className="bg-accent px-1 rounded">https://tika.nanotrik.ai/</code></li>
                  <li>Apache Tika zpracuje soubor a extrahuje text</li>
                  <li>Výsledný text se zobrazí zde na stránce</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6 mb-8 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
          <h3 className="text-lg font-semibold mb-4">Upload souboru</h3>
          <FileUpload onResult={handleResult} />
        </Card>

        {/* Results */}
        {result && (
          <Card className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Extrahovaný text</h3>
              <GlassmorphicButton onClick={handleDownloadText} variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Stáhnout jako TXT
              </GlassmorphicButton>
            </div>
            
            {/* File Info */}
            <div className="bg-accent/30 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Soubor:</span>
                  <p className="font-medium">{result.fileName}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Velikost:</span>
                  <p className="font-medium">{formatFileSize(result.fileSize)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Stránky:</span>
                  <p className="font-medium">{result.pageCount}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Typ:</span>
                  <p className="font-medium">{result.contentType}</p>
                </div>
              </div>
              
              {/* Metadata */}
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <div className="mt-4 pt-4 border-t border-accent/50">
                  <h4 className="font-medium text-muted-foreground mb-2">Metadata dokumentu:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {result.metadata.created && (
                      <div>
                        <span className="font-medium text-muted-foreground">Vytvořeno:</span>
                        <p className="font-medium">{new Date(result.metadata.created).toLocaleString('cs-CZ')}</p>
                      </div>
                    )}
                    {result.metadata.modified && (
                      <div>
                        <span className="font-medium text-muted-foreground">Upraveno:</span>
                        <p className="font-medium">{new Date(result.metadata.modified).toLocaleString('cs-CZ')}</p>
                      </div>
                    )}
                    {result.metadata.creator && (
                      <div>
                        <span className="font-medium text-muted-foreground">Autor:</span>
                        <p className="font-medium">{result.metadata.creator}</p>
                      </div>
                    )}
                    {result.metadata.producer && (
                      <div>
                        <span className="font-medium text-muted-foreground">Vytvořil:</span>
                        <p className="font-medium">{result.metadata.producer}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Page Navigation */}
            {result.pageCount > 1 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-accent/20 rounded-lg">
                <GlassmorphicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Předchozí
                </GlassmorphicButton>
                
                <span className="text-sm font-medium">
                  Stránka {currentPage + 1} z {result.pageCount}
                </span>
                
                <GlassmorphicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === result.pageCount - 1}
                >
                  Další
                  <ChevronRight className="h-4 w-4 ml-1" />
                </GlassmorphicButton>
              </div>
            )}

            {/* Current Page Text */}
            <div className="bg-background/80 rounded-lg p-4 max-h-96 overflow-y-auto">
              {result.pages && result.pages[currentPage] ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-accent/30 pb-2">
                    <h4 className="font-semibold text-sm">
                      Stránka {result.pages[currentPage].pageNumber}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {result.pages[currentPage].paragraphs.length} odstavců
                    </span>
                  </div>
                  <div className="space-y-3">
                    {result.pages[currentPage].paragraphs.map((paragraph, index) => (
                      <p key={index} className="text-sm leading-relaxed p-3 bg-accent/10 rounded-md">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Žádný text nebyl extrahován z tohoto souboru.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a 
              href="https://tika.apache.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Apache Tika
            </a>
            {' '} • PoC pro{' '}
            <span className="font-medium">nanotrik.ai</span>
          </p>
        </div>
      </div>
    </div>
  );
} 