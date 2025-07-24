import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { cosineDistance, desc, gt, sql, eq, or, isNull, and } from 'drizzle-orm';
import { embeddings } from '@/lib/db/schema/embeddings';
import { parse } from 'node-html-parser';
import { createEmbedding } from '@/lib/db/actions/embeddings';

const embeddingModel = openai.embedding('text-embedding-3-large', {
  dimensions: 1536,
});

const generateChunks = (input: string): string[] => {
  return [input]
    // .trim()
    // .split('.')
    // .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string, userId: string, assistantId?: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  
  // Základní podmínka - podobnost musí být vyšší než 0.5
  const similarityCondition = gt(similarity, 0.3);
  
  // Společné podmínky pro embeddings
  const userGeneralEmbeddings = and(
    eq(embeddings.userId, userId),
    isNull(embeddings.assistantId)
  );
  
  const globalEmbeddings = and(
    isNull(embeddings.userId),
    isNull(embeddings.assistantId)
  );
  
  let whereCondition;
  if (assistantId) {
    // Pokud máme assistantId, hledáme navíc i embeddings pro konkrétního assistanta
    const userAssistantEmbeddings = and(
      eq(embeddings.userId, userId),
      eq(embeddings.assistantId, assistantId)
    );
    
    whereCondition = and(
      similarityCondition,
      or(userAssistantEmbeddings, userGeneralEmbeddings, globalEmbeddings)
    );
  } else {
    // Bez assistantId hledáme pouze obecné embeddings
    whereCondition = and(
      similarityCondition,
      or(userGeneralEmbeddings, globalEmbeddings)
    );
  }
  
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(whereCondition)
    .orderBy(t => desc(t.similarity))
    .limit(4);
  return similarGuides;
};

export const uploadToTikaFromUrl = async (url: string) => {
  try {
    console.log(`Stahuji soubor z URL: ${url}`);
    
    // Stáhneme soubor z URL
    const fileResponse = await fetch(url);
    
    if (!fileResponse.ok) {
      throw new Error(`Nepodařilo se stáhnout soubor: ${fileResponse.status} ${fileResponse.statusText}`);
    }
    
    // Konvertujeme na blob
    const blob = await fileResponse.blob();
    
    // Zkontrolujeme velikost souboru (max 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      throw new Error('Soubor je příliš velký (max 10MB)');
    }
    
    console.log(`Zpracovávám soubor z URL, velikost: ${blob.size} bytes`);

    // Konvertujeme blob na FormData pro Tiku
    const tikaFormData = new FormData();
    tikaFormData.append('upload', blob);

    // Pošleme soubor na Tika server
    const tikaResponse = await fetch('https://tika.nanotrik.ai/rmeta/form', {
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
      sourceUrl: url,
      fileSize: blob.size,
      contentType: documentData['Content-Type'] || 'unknown',
      pageCount: pageCount,
      pages: pages,
      metadata: {
        created: documentData['dcterms:created'],
        modified: documentData['dcterms:modified'],
        creator: documentData['pdf:docinfo:creator_tool'] || documentData['xmp:CreatorTool'],
      },
      fetchMethod: 'URL to blob upload'
    };
    
    return result;

  } catch (error) {
    console.error('Chyba při zpracování souboru z URL:', error);
    throw new Error(`Vnitřní chyba při zpracování souboru z URL: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
  }
};

// Supported content types pro Tiku
const SUPPORTED_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/html',
  'application/rtf'
];

interface ExperimentalAttachment {
  name: string;
  contentType: string;
  url: string;
}

export const processAttachmentsForEmbeddings = async (
  attachments: ExperimentalAttachment[],
  userId: string,
  assistantId?: string
) => {
  console.log(`Začínám paralelní zpracování ${attachments.length} příloh...`);
  
  // Vytvoříme promise pro každý attachment
  const attachmentPromises = attachments.map(async (attachment) => {
    try {
      // Zkontrolujeme, zda je content type podporovaný pro embeddings
      if (!SUPPORTED_CONTENT_TYPES.includes(attachment.contentType)) {
        console.log(`Přeskakuji soubor ${attachment.name} - nepodporovaný typ: ${attachment.contentType}`);
        return {
          fileName: attachment.name,
          status: 'skipped' as const,
          reason: 'Nepodporovaný typ souboru pro embeddings'
        };
      }

      console.log(`Zpracovávám soubor ${attachment.name} pro embeddings...`);
      
      // Použijeme naši funkci na zpracování souboru přes Tiku
      const tikaResult = await uploadToTikaFromUrl(attachment.url);
      
      // Zpracujeme všechny stránky paralelně pomocí Promise.all
      const pagePromises = tikaResult.pages
        .filter(page => page.content && page.content.trim().length > 0)
        .map(async (page) => {
          await createEmbedding({
            content: page.content,
            userId: userId,
            assistantId: assistantId
          });
          console.log(`Vytvořen embedding pro stránku ${page.pageNumber} souboru ${attachment.name}`);
          return page.pageNumber;
        });
      
      // Čekáme na dokončení všech embeddingů pro tento soubor
      await Promise.all(pagePromises);
      
      return {
        fileName: attachment.name,
        status: 'success' as const,
        pageCount: tikaResult.pageCount,
        contentType: tikaResult.contentType,
        embeddingsCreated: tikaResult.pages.filter(p => p.content?.trim().length > 0).length
      };
      
    } catch (error) {
      console.error(`Chyba při zpracování souboru ${attachment.name}:`, error);
      return {
        fileName: attachment.name,
        status: 'error' as const,
        error: error instanceof Error ? error.message : 'Neznámá chyba'
      };
    }
  });
  
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
};