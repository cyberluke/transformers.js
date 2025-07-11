import fs from 'fs';
import { parse } from 'node-html-parser';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'Soubor není přiložen' }, { status: 400 });
    }

    // Zkontrolujeme velikost souboru (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'Soubor je příliš velký (max 10MB)' }, { status: 400 });
    }

    console.log(`Zpracovávám soubor: ${file.name}, velikost: ${file.size} bytes`);

    // Konvertujeme File na FormData pro Tiku
    const tikaFormData = new FormData();
    tikaFormData.append('file', file);

    // Pošleme soubor na Tika server (používáme /rmeta/form pro strukturovaná data)
    const tikaResponse = await fetch('https://tika.nanotrik.ai/rmeta/form', {
      method: 'POST',
      body: tikaFormData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!tikaResponse.ok) {
      console.error('Tika server error:', tikaResponse.status, tikaResponse.statusText);
      return Response.json({ 
        error: 'Chyba při zpracování souboru na Tika serveru' 
      }, { status: 500 });
    }

    const tikaData = await tikaResponse.json();
    console.log('Tika response:', JSON.stringify(tikaData, null, 2));
    
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
    
    // Strukturujeme výsledek
    const result = {
      fileName: file.name,
      fileSize: file.size,
      contentType: documentData['Content-Type'] || 'unknown',
      pageCount: pageCount,
      pages: pages,
      metadata: {
        created: documentData['dcterms:created'],
        modified: documentData['dcterms:modified'],
        creator: documentData['pdf:docinfo:creator_tool'] || documentData['xmp:CreatorTool'],
      }
    };
    
    return Response.json(result);

  } catch (error) {
    console.error('Chyba při zpracování souboru:', error);
    return Response.json({ 
      error: 'Vnitřní chyba serveru při zpracování souboru' 
    }, { status: 500 });
  }
} 