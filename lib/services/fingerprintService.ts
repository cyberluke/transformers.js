import FingerprintJS, { GetResult } from "@fingerprintjs/fingerprintjs-pro";

export interface FingerprintData {
  requestId: string;
  visitorId: string;
  confidence: number;
  extendedResult?: any;
}

export class FingerprintService {
  private static instance: FingerprintService;
  private fp: any = null;
  private apiKey: string;
  private _isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static getInstance(apiKey?: string): FingerprintService {
    if (!FingerprintService.instance) {
      if (!apiKey) {
        throw new Error('API key is required for first initialization');
      }
      FingerprintService.instance = new FingerprintService(apiKey);
    }
    return FingerprintService.instance;
  }

  async initialize(): Promise<void> {
    if (this._isInitialized) return; // Already initialized
    if (this.initializationPromise) return this.initializationPromise; // Already initializing
    
    this.initializationPromise = this.doInitialize();
    await this.initializationPromise;
    this._isInitialized = true;
  }

  private async doInitialize(): Promise<void> {
    try {
      this.fp = await FingerprintJS.load({
        apiKey: this.apiKey,
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize FingerprintJS: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getFingerprint(): Promise<GetResult> {
    if (!this._isInitialized) {
      await this.initialize(); // Lazy initialization fallback
    }

    try {
      const result = await this.fp.get({ extendedResult: true });
      return result;
    } catch (error) {
      throw new Error(
        `Failed to get fingerprint: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getFingerprintData(): Promise<FingerprintData> {
    const result = await this.getFingerprint();
    
    return {
      requestId: result.requestId,
      visitorId: result.visitorId,
      confidence: result.confidence?.score || 0,
      extendedResult: result,
    };
  }

  isInitialized(): boolean {
    return this._isInitialized;
  }
}

export const getFingerprintService = (): FingerprintService => {
  const apiKey = process.env.NEXT_PUBLIC_FINGERPRINT_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FINGERPRINT_API_KEY environment variable is required');
  }
  return FingerprintService.getInstance(apiKey);
};