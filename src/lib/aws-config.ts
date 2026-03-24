import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 Storage (S3-compatible API)
const useR2 = process.env.USE_AWS === "true";
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2Endpoint = process.env.R2_ENDPOINT;

let s3Client: S3Client | null = null;

if (useR2 && r2AccessKeyId && r2SecretAccessKey) {
    try {
        s3Client = new S3Client({
            region: 'auto',
            credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
            endpoint: r2Endpoint,
            forcePathStyle: true
        });
        console.log("✅ Cloudflare R2 client initialized.");
    } catch (err) {
        console.error("🚨 Failed to initialize R2 client:", err);
        s3Client = null;
    }
} else {
    console.log("📁 R2 not configured. Set USE_AWS=true + R2 credentials in .env.local.");
}

export const s3 = s3Client;
export const S3_BUCKET = process.env.S3_BUCKET || "geoforesight-assets";
export const useAWS = useR2;
