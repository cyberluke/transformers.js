// Utility pro generování SHA-256 hash z blob
export async function generateFileHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Utility pro validaci file hash formátu
export function isValidFileHash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

// Utility pro porovnání hash
export function compareFileHashes(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
} 