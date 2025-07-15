import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/server/s3/s3Service';
import { validateFile, isAllowedFileType, type AllowedMimeType } from '@/types/attachments';
import { ulid } from 'ulid';

// Rate limiting - jednoduché in-memory řešení (pro produkci použij Redis)
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 uploadů za 15 minut
const RATE_WINDOW = 15 * 60 * 1000; // 15 minut

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = uploadAttempts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    uploadAttempts.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { success: false, error: 'Příliš mnoho pokusů o nahrání. Zkuste to později.' },
        { status: 429 }
      );
    }

    // Získání form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Žádný soubor nebyl vybrán.' },
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

    // Vytvoření attachment objektu
    const attachment = {
      id: ulid(),
      name: file.name,
      contentType: file.type,
      url,
      size: file.size,
      uploadedAt: new Date(),
      key,
    };

    return NextResponse.json({
      success: true,
      attachment,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Neočekávaná chyba při nahrávání.' 
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