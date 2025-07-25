import { parse } from 'node-html-parser';
import { FILE_SIZE_LIMITS, TIKA_CONFIG } from '@/lib/constants/supported-file-types';

// Typ pro výsledek Tika zpracování
export interface TikaResult {
  sourceUrl?: string;
  fileSize: number;
  contentType: string;
  pageCount: number;
  pages: {
    pageNumber: number;
    content: string;
    paragraphs: string[];
  }[];
  metadata: {
    created?: string;
    modified?: string;
    creator?: string;
  };
  fetchMethod: string;
}

// Helper funkce pro parsování Tika response
function parseTikaResponse(tikaData: any, fileSize: number, sourceUrl?: string, fetchMethod: string = 'Blob upload'): TikaResult {
  // Extrahujeme první objekt z pole (Tika vrací pole s jedním objektem)
  const documentData = Array.isArray(tikaData) ? tikaData[0] : tikaData;
  
  // Získáme počet stran
  const pageCount = parseInt(documentData['xmpTPg:NPages'] || '0');
  
  // Získáme HTML obsah
  const htmlContent = documentData['X-TIKA:content'] || '';
  
  // Naparsujeme HTML
  const root = parse(htmlContent);
  
  // Najdeme všechny stránky
  const pageElements = root.querySelectorAll('.page');
  
  const pages = pageElements.map((pageElement, index) => {
    // Extrahujeme text z paragraffů, ale vynecháme prázdné
    const paragraphs = pageElement.querySelectorAll('p')
      .map(p => p.text.trim())
      .filter(text => text.length > 0);
    
    return {
      pageNumber: index + 1,
      content: paragraphs.join('\n'),
      paragraphs: paragraphs
    };
  });
  
  return {
    sourceUrl,
    fileSize,
    contentType: documentData['Content-Type'] || 'unknown',
    pageCount,
    pages,
    metadata: {
      created: documentData['dcterms:created'],
      modified: documentData['dcterms:modified'],
      creator: documentData['pdf:docinfo:creator_tool'] || documentData['xmp:CreatorTool'],
    },
    fetchMethod
  };
}

// Hlavní funkce pro upload blob na Tika server
export async function uploadToTikaFromBlob(blob: Blob, sourceUrl?: string): Promise<TikaResult> {
  try {
    // Zkontrolujeme velikost souboru
    if (blob.size > FILE_SIZE_LIMITS.MAX_FILE_SIZE) {
      throw new Error(`Soubor je příliš velký (max ${FILE_SIZE_LIMITS.MAX_FILE_SIZE_MB}MB)`);
    }
    
    console.log(`Zpracovávám blob, velikost: ${blob.size} bytes`);

    // Konvertujeme blob na FormData pro Tiku
    const tikaFormData = new FormData();
    tikaFormData.append('upload', blob);

    // Pošleme soubor na Tika server
    const tikaResponse = await fetch(`${TIKA_CONFIG.SERVER_URL}${TIKA_CONFIG.RMETA_ENDPOINT}`, {
      method: 'POST',
      body: tikaFormData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!tikaResponse.ok) {
      console.error('Tika server error:', tikaResponse.status, tikaResponse.statusText);
      const errorText = await tikaResponse.text();
      console.error('Tika error details:', errorText);
      throw new Error(`Chyba při zpracování souboru na Tika serveru: ${tikaResponse.status} ${tikaResponse.statusText}`);
    }

    const tikaData = await tikaResponse.json();
    console.log('Tika response:', JSON.stringify(tikaData, null, 2));
    
    return parseTikaResponse(tikaData, blob.size, sourceUrl, 'Blob upload');

  } catch (error) {
    console.error('Chyba při zpracování blob:', error);
    throw new Error(`Vnitřní chyba při zpracování blob: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
  }
}

// Wrapper funkce pro upload z URL (stáhne soubor a použije blob verzi)
export async function uploadToTikaFromUrl(url: string): Promise<TikaResult> {
  try {
    console.log(`Stahuji soubor z URL: ${url}`);
    
    // Stáhneme soubor z URL
    const fileResponse = await fetch(url);
    
    if (!fileResponse.ok) {
      throw new Error(`Nepodařilo se stáhnout soubor: ${fileResponse.status} ${fileResponse.statusText}`);
    }
    
    // Konvertujeme na blob a použijeme novou funkci
    const blob = await fileResponse.blob();
    return await uploadToTikaFromBlob(blob, url);

  } catch (error) {
    console.error('Chyba při zpracování souboru z URL:', error);
    throw new Error(`Vnitřní chyba při zpracování souboru z URL: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
  }
} 