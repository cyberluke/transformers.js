import { parse } from 'node-html-parser';
import fs from 'fs';

export const maxDuration = 30;

// GET endpoint - používá Tika HttpFetcher pro přímé fetchování z URL
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileUrl = url.searchParams.get('url') || 'https://s4.nanotrik.ai/attachments/2025-07-24/01K0Y5Q9XMVJ7FBYFR651GZB59.pdf';
    
    console.log(`Posílám URL na Tika server: ${fileUrl}`);

    // Pošleme URL přímo na Tika server pomocí HttpFetcher
    // Tika server si soubor stáhne sám
    const tikaResponse = await fetch('https://tika.nanotrik.ai/rmeta/form', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'fetcherName': 'http',
        'fetchKey': fileUrl
      }
    });

    if (!tikaResponse.ok) {
      console.error('Tika server error:', tikaResponse.status, tikaResponse.statusText);
      const errorText = await tikaResponse.text();
      console.error('Tika error details:', errorText);
      return Response.json({ 
        error: `Chyba při zpracování souboru na Tika serveru: ${tikaResponse.status} ${tikaResponse.statusText}`,
        details: errorText
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
      sourceUrl: fileUrl,
      contentType: documentData['Content-Type'] || 'unknown',
      pageCount: pageCount,
      pages: pages,
      metadata: {
        created: documentData['dcterms:created'],
        modified: documentData['dcterms:modified'],
        creator: documentData['pdf:docinfo:creator_tool'] || documentData['xmp:CreatorTool'],
      },
      // Informace o tom, že Tika si soubor stáhla sama
      fetchMethod: 'Tika HttpFetcher'
    };
    
    return Response.json(result);

  } catch (error) {
    console.error('Chyba při zpracování souboru z URL:', error);
    return Response.json({ 
      error: 'Vnitřní chyba serveru při zpracování souboru z URL',
      details: error instanceof Error ? error.message : 'Neznámá chyba'
    }, { status: 500 });
  }
}

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
    tikaFormData.append('upload', file);

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
    fs.writeFileSync('tikaData.json', JSON.stringify(tikaData, null, 2));
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