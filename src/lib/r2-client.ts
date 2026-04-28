import { S3Client } from '@aws-sdk/client-s3';

const r2AccountID = process.env.CLOUDFLARE_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const r2Endpoint = process.env.R2_ENDPOINT;

// Fallback to S3_BUCKET if R2_BUCKET is not set
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET || '';
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint || (r2AccountID ? `https://${r2AccountID}.r2.cloudflarestorage.com` : undefined),
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

export const getMissingR2Vars = () => {
  const vars = [];
  if (!r2AccountID && !r2Endpoint) vars.push('CLOUDFLARE_ACCOUNT_ID or R2_ENDPOINT');
  if (!r2AccessKeyId) vars.push('R2_ACCESS_KEY_ID');
  if (!r2SecretAccessKey) vars.push('R2_SECRET_ACCESS_KEY');
  if (!R2_BUCKET_NAME) vars.push('R2_BUCKET_NAME (or S3_BUCKET)');
  return vars;
};
