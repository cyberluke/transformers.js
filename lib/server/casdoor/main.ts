import { casdoorClientConfig } from '@/lib/casdoor-config';
import { SDK } from 'casdoor-nodejs-sdk';
import fs from 'fs';
import path from 'path';
// import { cert } from './cert';

const cert = fs.readFileSync('cert.crt', 'utf8');

const authCfg = {
  endpoint: casdoorClientConfig.serverUrl,
  clientId: casdoorClientConfig.clientId,
  clientSecret: process.env.AUTH_CASDOOR_SECRET!,
  certificate: cert,
  orgName: casdoorClientConfig.organizationName,
}

const sdk = new SDK(authCfg);

export default sdk;