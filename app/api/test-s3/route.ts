import { NextRequest, NextResponse } from 'next/server';
import { s3Service } from '@/lib/server/s3/s3Service';

export async function GET(request: NextRequest) {
  try {
    // Test S3 konfigurace
    const testResult = await s3Service.testConnection();
    
    // Rozpoznání account ID z endpointu
    const accountIdMatch = process.env.S3_ENDPOINT?.match(/https:\/\/([^.]+)\./);
    const accountId = accountIdMatch ? accountIdMatch[1] : null;
    
    // Diagnostické informace (bez citlivých údajů)
    const diagnostics = {
      hasAccessKeyId: !!process.env.S3_ACCESS_KEY_ID,
      hasSecretAccessKey: !!process.env.S3_SECRET_ACCESS_KEY,
      hasEndpoint: !!process.env.S3_ENDPOINT,
      hasBucket: !!process.env.S3_BUCKET,
      hasPublicDomain: !!process.env.S3_PUBLIC_DOMAIN,
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET,
      enablePathStyle: process.env.S3_ENABLE_PATH_STYLE,
      accountId: accountId,
      accessKeyIdPrefix: process.env.S3_ACCESS_KEY_ID?.substring(0, 8) + '***',
    };

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      diagnostics,
    });

  } catch (error) {
    console.error('S3 test error:', error);
    
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Neočekávaná chyba',
      diagnostics: {
        hasAccessKeyId: !!process.env.S3_ACCESS_KEY_ID,
        hasSecretAccessKey: !!process.env.S3_SECRET_ACCESS_KEY,
        hasEndpoint: !!process.env.S3_ENDPOINT,
        hasBucket: !!process.env.S3_BUCKET,
        hasPublicDomain: !!process.env.S3_PUBLIC_DOMAIN,
      }
    }, { status: 500 });
  }
} 