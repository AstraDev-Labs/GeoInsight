import { S3Client } from '@aws-sdk/client-s3';

const r2AccountID = process.env.CLOUDFLARE_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2Endpoint = process.env.R2_ENDPOINT;

// Fallback to S3_BUCKET if R2_BUCKET is not set
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET || '';
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint || `https://${r2AccountID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId || '',
    secretAccessKey: r2SecretAccessKey || '',
  },
});

export const isR2Configured = Boolean(
  (r2AccountID || r2Endpoint) &&
  r2AccessKeyId &&
  r2SecretAccessKey &&
  R2_BUCKET_NAME
);
