import {
  FingerprintJsServerApiClient,
  Region,
} from '@fingerprintjs/fingerprintjs-pro-server-api'

console.log(process.env.FINGERPRINT_API_KEY);

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.FINGERPRINT_API_KEY!,
  region: Region.EU,
})

export default client;