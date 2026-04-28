import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, isR2Configured } from './r2-client';

/**
 * Deletes files from Cloudflare R2 bucket given their public URLs or keys.
 * @param urls Array of file URLs or keys to delete
 */
export async function deleteR2Files(urls: string[] | undefined): Promise<void> {
    if (!urls || urls.length === 0 || !isR2Configured) return;

    const deletionPromises = urls.map(async (url) => {
        try {
            // Extract the key from the URL
            // URLs typically look like: https://pub-...r2.dev/uploads/filename.jpg
            // or /api/files/filename.jpg
            // The key in R2 should be: uploads/filename.jpg
            
            let key = '';
            if (url.startsWith('http')) {
                const urlParts = url.split('/');
                const filename = urlParts[urlParts.length - 1];
                key = `uploads/${filename}`;
            } else if (url.startsWith('/uploads/')) {
                key = url.substring(1); // remove leading slash
            } else if (url.includes('uploads/')) {
                key = url.substring(url.indexOf('uploads/'));
            }

            if (!key) return;

            console.log(`Deleting from R2: ${key}`);
            await r2Client.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: key,
                })
            );
        } catch (error) {
            console.error(`Failed to delete file from R2: ${url}`, error);
        }
    });

    await Promise.all(deletionPromises);
}
