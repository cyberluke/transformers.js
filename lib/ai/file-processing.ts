import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createFile, updateFile } from '@/lib/db/actions/files';
import { generateFileHash } from '@/lib/utils/file-hash';
import { uploadToTikaFromBlob } from './tika';
import { SUPPORTED_CONTENT_TYPES } from '@/lib/constants/supported-file-types';

// Typ pro experimental attachment
export interface ExperimentalAttachment {
  name: string;
  contentType: string;
  url: string;
}

// Typ pro výsledek zpracování jednoho souboru
export interface FileProcessingResult {
  fileName: string;
  fileId?: string;
  fileHash?: string;
  status: 'success' | 'error' | 'skipped';
  pageCount?: number;
  contentType?: string;
  embeddingsCreated?: number;
  reason?: string;
  error?: string;
}

// Zpracování jednoho souboru (helper funkce)
async function processFileWithEmbeddings(
  attachment: ExperimentalAttachment,
  userId?: string,
  agentId?: string
): Promise<FileProcessingResult> {
  let fileId: string | undefined;
  
  try {
    // Ověříme, že je poskytnut minimálně jeden z parametrů
    if (!userId && !agentId) {
      throw new Error('Musí být poskytnut minimálně userId nebo agentId');
    }

    // Zkontrolujeme, zda je content type podporovaný pro embeddings
    if (!SUPPORTED_CONTENT_TYPES.includes(attachment.contentType)) {
      console.log(`Přeskakuji soubor ${attachment.name} - nepodporovaný typ: ${attachment.contentType}`);
      return {
        fileName: attachment.name,
        status: 'skipped',
        reason: 'Nepodporovaný typ souboru pro embeddings'
      };
    }

    console.log(`Zpracovávám soubor ${attachment.name} pro embeddings...`);
    
    // 1. Stáhneme soubor jednou pro hash i Tiku
    const fileResponse = await fetch(attachment.url);
    if (!fileResponse.ok) {
      throw new Error(`Nepodařilo se stáhnout soubor: ${fileResponse.status}`);
    }
    const blob = await fileResponse.blob();
    const fileHash = await generateFileHash(blob);
    
    // 2. Vytvoříme file záznam
    const file = await createFile({
      fileName: attachment.name,
      fileHash: fileHash,
      contentType: attachment.contentType,
      fileSize: blob.size,
      sourceUrl: attachment.url,
      userId: userId,
      assistantId: agentId,
      status: 'processing'
    });
    fileId = file.id;
    
    // 3. Zpracujeme stejný blob přes Tiku (žádný další fetch!)
    const tikaResult = await uploadToTikaFromBlob(blob, attachment.url);
    
    // 4. Zpracujeme všechny stránky paralelně pomocí Promise.all
    const pagePromises = tikaResult.pages
      .filter(page => page.content && page.content.trim().length > 0)
      .map(async (page) => {
        const embeddingResult = await createEmbedding({
          fileId: file.id,
          pageNumber: page.pageNumber,
          content: page.content,
          userId: userId,
          assistantId: agentId
        });
        
        if (embeddingResult.success) {
          console.log(`Vytvořen embedding pro stránku ${page.pageNumber} souboru ${attachment.name}`);
        } else {
          console.error(`Chyba při vytváření embeddingu pro stránku ${page.pageNumber}:`, embeddingResult.error);
        }
        
        return page.pageNumber;
      });
    
    // 5. Čekáme na dokončení všech embeddingů
    await Promise.all(pagePromises);
    
    // 6. Updatujeme file na completed
    await updateFile(file.id, {
      status: 'completed',
      pageCount: tikaResult.pageCount,
      metadata: tikaResult.metadata
    });
    
    return {
      fileName: attachment.name,
      fileId: file.id,
      fileHash: fileHash,
      status: 'success',
      pageCount: tikaResult.pageCount,
      contentType: tikaResult.contentType,
      embeddingsCreated: tikaResult.pages.filter(p => p.content?.trim().length > 0).length
    };
    
  } catch (error) {
    console.error(`Chyba při zpracování souboru ${attachment.name}:`, error);
    
    // Pokud se file vytvořil, označíme ho jako error
    if (fileId) {
      try {
        await updateFile(fileId, {
          status: 'error'
        });
      } catch (updateError) {
        console.error('Chyba při updatu file status na error:', updateError);
      }
    }
    
    return {
      fileName: attachment.name,
      status: 'error',
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    };
  }
}

// Hlavní funkce pro zpracování všech attachmentů paralelně
export async function processAttachmentsForEmbeddings(
  attachments: ExperimentalAttachment[],
  userId?: string,
  agentId?: string
): Promise<FileProcessingResult[]> {
  // Ověříme, že je poskytnut minimálně jeden z parametrů
  if (!userId && !agentId) {
    throw new Error('Musí být poskytnut minimálně userId nebo agentId');
  }

  console.log(`Začínám paralelní zpracování ${attachments.length} příloh...`);
  
  // Vytvoříme promise pro každý attachment
  const attachmentPromises = attachments.map(attachment => 
    processFileWithEmbeddings(attachment, userId, agentId)
  );
  
  // Čekáme na dokončení všech attachmentů (allSettled = nepřeruší se při chybě jednoho)
  const results = await Promise.allSettled(attachmentPromises);
  
  // Zpracujeme výsledky
  const processedResults = results.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('Neočekávaná chyba při zpracování přílohy:', result.reason);
      return {
        fileName: 'neznámý soubor',
        status: 'error' as const,
        error: 'Neočekávaná chyba při zpracování'
      };
    }
  });
  
  console.log(`Dokončeno paralelní zpracování všech příloh`);
  return processedResults;
} 