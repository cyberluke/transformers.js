'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgentSelector } from '@/components/sections/chat-inset/welcome';
import { validateFile } from '@/types/attachments';

interface UploadResult {
  success: boolean;
  fileName: string;
  message?: string;
  error?: string;
  fileId?: string;
  pageCount?: number;
  embeddingsCreated?: number;
}

export default function EmbedPocPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!selectedAgent) {
      alert('Nejdříve vyberte agenta');
      return;
    }

    setUploading(true);

    // Zpracujeme každý soubor
    const results: UploadResult[] = [];
    
    for (const file of Array.from(files)) {
      try {
        // Validace souboru
        const validation = validateFile(file);
        if (!validation.valid) {
          results.push({
            success: false,
            fileName: file.name,
            error: validation.error
          });
          continue;
        }

        // Vytvoření FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('agentId', selectedAgent);

        // Upload
        const response = await fetch('/api/embed', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          results.push({
            success: true,
            fileName: file.name,
            message: result.message,
            fileId: result.fileId,
            pageCount: result.pageCount,
            embeddingsCreated: result.embeddingsCreated
          });
        } else {
          results.push({
            success: false,
            fileName: file.name,
            error: result.error
          });
        }

      } catch (error) {
        console.error('Upload error:', error);
        results.push({
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Neočekávaná chyba'
        });
      }
    }

    setUploadResults(prev => [...results, ...prev]);
    setUploading(false);

    // Vyčistíme input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Embedding POC</h1>
          <p className="text-muted-foreground">
            Nahrajte dokumenty k jednotlivým agentům pro vytvoření embeddingů
          </p>
        </div>

        {/* Agent Selection */}
        <Card className="p-6">
          <AgentSelector 
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
          />
        </Card>

        {/* File Upload */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nahrání dokumentů</h3>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Button
                onClick={handleFileSelect}
                disabled={!selectedAgent || uploading}
                className="mb-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Zpracovávám...
                  </>
                ) : (
                  'Vyberte soubory'
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                PDF, DOC, DOCX, TXT a další podporované formáty
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximální velikost: 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md,.rtf,.odt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </Card>

        {/* Results */}
        {uploadResults.length > 0 && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Výsledky nahrávání</h3>
                <Button variant="outline" size="sm" onClick={clearResults}>
                  Vymazat
                </Button>
              </div>

              <div className="space-y-3">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium truncate">{result.fileName}</span>
                      </div>
                      
                      {result.success ? (
                        <div className="space-y-1">
                          <p className="text-sm text-green-700">
                            {result.message}
                          </p>
                          {result.pageCount && result.embeddingsCreated && (
                            <p className="text-xs text-gray-600">
                              Stránek: {result.pageCount} • Embeddingů: {result.embeddingsCreated}
                            </p>
                          )}
                          {result.fileId && (
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {result.fileId}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-red-700">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 