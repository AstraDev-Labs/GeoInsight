import { s3, S3_BUCKET } from '@/lib/aws-config';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Helper to delete associated files (images, documents) from Cloudflare R2 / AWS S3
 * Validates the URL structure and extracts the correct Object Key for deletion.
 */
export const deleteBucketFiles = async (fileUrls: string[] | undefined) => {
    if (!fileUrls || fileUrls.length === 0) {
        return;
    }

    if (!s3) {
        console.warn("⚠️ S3 client not initialized. Skipping file deletion.");
        return;
    }
    
    console.log(`🗑️ Starting cleanup for ${fileUrls.length} files...`);

    for (const url of fileUrls) {
        try {
            let key = '';
            const parsedUrl = new URL(url);
            
            // 1. Cloudflare R2 path-style or S3-style
            if (url.includes('cloudflarestorage.com')) {
                // Path format: /<bucket>/<key>
                const bucketMatch = url.match(new RegExp(`/${S3_BUCKET}/(.+)`));
                if (bucketMatch) {
                    key = bucketMatch[1];
                } else {
                    // Fallback: take everything after the first slash in pathname
                    key = parsedUrl.pathname.split('/').slice(2).join('/');
                }
            } 
            // 2. Cloudflare R2 Public URL (r2.dev or custom endpoint)
            else if (url.includes('.r2.dev') || process.env.NEXT_PUBLIC_R2_URL && url.startsWith(process.env.NEXT_PUBLIC_R2_URL)) {
                // Determine base URL to strip
                let baseUrl = '';
                if (process.env.NEXT_PUBLIC_R2_URL && url.startsWith(process.env.NEXT_PUBLIC_R2_URL)) {
                     baseUrl = process.env.NEXT_PUBLIC_R2_URL;
                } else {
                     baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
                }
                
                key = url.substring(baseUrl.length);
                if (key.startsWith('/')) {
                    key = key.substring(1);
                }
            }
            // 3. AWS S3 (Virtual Hosted or Path Style)
            else if (url.includes('amazonaws.com')) {
                const hostParts = parsedUrl.hostname.split('.');
                if (hostParts[0] === S3_BUCKET) {
                    // Virtual Hosted Style: bucket.s3.region.amazonaws.com/key
                    key = parsedUrl.pathname.substring(1);
                } else {
                    // Path Style: s3.region.amazonaws.com/bucket/key
                    const bucketPrefix = `/${S3_BUCKET}/`;
                    if (parsedUrl.pathname.startsWith(bucketPrefix)) {
                        key = parsedUrl.pathname.substring(bucketPrefix.length);
                    } else {
                        key = parsedUrl.pathname.substring(1);
                    }
                }
            }
            // 4. Fallback for any other internal-looking paths
            else if (url.startsWith('/uploads/')) {
                key = url.substring(1);
            }

            if (key) {
                console.log(`   👉 Attempting to delete key: "${key}" from bucket: "${S3_BUCKET}"`);
                await s3.send(new DeleteObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key
                }));
                console.log(`   ✅ Successfully deleted: ${key}`);
            } else {
                console.warn(`   ❓ Could not determine storage key for URL: ${url}`);
            }
        } catch (err) {
            console.error(`   ❌ Failed to delete file ${url}:`, err);
        }
    }
};
