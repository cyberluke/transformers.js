import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ulid } from 'ulid';
import type { AllowedMimeType } from '@/types/attachments';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
  publicDomain: string;
  enablePathStyle: boolean;
}

class S3Service {
  private client: S3Client;
  private config: S3Config;

  constructor() {
    // Ověření ENV proměnných
    const requiredEnvVars = [
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY', 
      'S3_ENDPOINT',
      'S3_BUCKET',
      'S3_PUBLIC_DOMAIN'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    this.config = {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      endpoint: process.env.S3_ENDPOINT!,
      bucket: process.env.S3_BUCKET!,
      publicDomain: process.env.S3_PUBLIC_DOMAIN!,
      enablePathStyle: process.env.S3_ENABLE_PATH_STYLE === '1',
    };

    this.client = new S3Client({
      region: 'auto', // Cloudflare R2 používá 'auto'
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: this.config.enablePathStyle,
      // Přidání dodatečné konfigurace pro R2
      requestHandler: {
        requestTimeout: 10000, // 10 sekund timeout
      },
    });
  }

  /**
   * Nahraje soubor do S3 a vrátí veřejnou URL
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: AllowedMimeType,
    size: number
  ): Promise<{ url: string; key: string }> {
    // Sanitizace filename
    const sanitizedFilename = this.sanitizeFilename(filename);
    
    // Generování unique key
    const key = this.generateFileKey(sanitizedFilename);

    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: size,
        // Public read access a cache headers
        ACL: 'public-read',
        CacheControl: 'public, max-age=31536000', // 1 rok cache
        ContentDisposition: `inline; filename="${sanitizedFilename}"`,
      });

      await this.client.send(command);

      // Sestavení veřejné URL
      const url = this.getPublicUrl(key);

      return { url, key };
    } catch (error: any) {
      console.error('S3 upload error:', error);
      
      // Specific error handling
      if (error.Code === 'NotEntitled') {
        throw new Error('R2 služba není povolená. Povolte R2 v Cloudflare Dashboard.');
      }
      
      if (error.Code === 'InvalidAccessKeyId') {
        throw new Error('Neplatný Access Key ID. Zkontrolujte ENV proměnné.');
      }
      
      if (error.Code === 'SignatureDoesNotMatch') {
        throw new Error('Neplatný Secret Access Key. Zkontrolujte ENV proměnné.');
      }
      
      if (error.Code === 'NoSuchBucket') {
        throw new Error(`Bucket '${this.config.bucket}' neexistuje.`);
      }
      
      const errorMessage = error.message || error.Code || 'Neznámá chyba';
      throw new Error(`S3 upload chyba: ${errorMessage}`);
    }
  }

  /**
   * Smaže soubor z S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  }

  /**
   * Generuje jedinečný klíč pro soubor s bezpečným ULID
   */
  private generateFileKey(filename: string): string {
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const randomId = ulid();
    const extension = filename.split('.').pop();
    
    return `attachments/${timestamp}/${randomId}.${extension}`;
  }

  /**
   * Sanitizuje filename pro bezpečnost
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Nahradí nebezpečné znaky
      .replace(/_{2,}/g, '_') // Nahradí více podtržítek jedním
      .slice(0, 100); // Omezí délku
  }

  /**
   * Sestaví veřejnou URL pro soubor
   */
  private getPublicUrl(key: string): string {
    return `${this.config.publicDomain}/${key}`;
  }

  /**
   * Testuje S3 konfiguraci a připojení
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Pokus o seznam objektů v bucketu (pro test připojení)
      const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
      const command = new ListObjectsV2Command({
        Bucket: this.config.bucket,
        MaxKeys: 1,
      });

      await this.client.send(command);
      
      return {
        success: true,
        message: 'S3 konfigurace je v pořádku',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `S3 test selhal: ${error.Code || error.message}`,
      };
    }
  }


}

// Singleton instance
export const s3Service = new S3Service(); 