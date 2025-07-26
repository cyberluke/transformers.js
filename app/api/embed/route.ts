import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/server/s3/s3Service';
import { validateFile, isAllowedFileType, type AllowedMimeType } from '@/types/attachments';
import { processAttachmentsForEmbeddings } from '@/lib/ai/file-processing';
import { ulid } from 'ulid';

export async function POST(request: NextRequest) {
  try {

    // Získání form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const agentId = formData.get('agentId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Žádný soubor nebyl vybrán.' },
        { status: 400 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'ID agenta je povinné.' },
        { status: 400 }
      );
    }

    // Validace souboru
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Double-check typu souboru
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Nepodporovaný typ souboru.' },
        { status: 400 }
      );
    }

    console.log(`Zpracovávám soubor ${file.name} pro agenta ${agentId}...`);

    // Konverze souboru na buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload do S3
    const { url, key } = await s3Service.uploadFile(
      buffer,
      file.name,
      file.type as AllowedMimeType,
      file.size
    );

    // Vytvoření attachment objektu pro zpracování embeddingů
    const attachment = {
      id: ulid(),
      name: file.name,
      contentType: file.type,
      url,
      size: file.size,
      uploadedAt: new Date(),
      key,
    };

    // Zpracování embeddingů
    const embeddingResults = await processAttachmentsForEmbeddings(
      [attachment],
      undefined, // userId
      agentId    // agentId
    );

    const result = embeddingResults[0];

    if (result.status === 'success') {
      return NextResponse.json({
        success: true,
        message: `Soubor ${file.name} byl úspěšně nahrán a zpracován.`,
        fileId: result.fileId,
        fileName: result.fileName,
        pageCount: result.pageCount,
        embeddingsCreated: result.embeddingsCreated,
        attachment
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || `Chyba při zpracování souboru: ${result.reason}`,
        attachment
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Embed error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Neočekávaná chyba při zpracování embeddingu.' 
      },
      { status: 500 }
    );
  }
}

// Přidání CORS headers
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 