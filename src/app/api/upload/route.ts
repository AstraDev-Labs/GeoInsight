import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured, getMissingR2Vars } from '@/lib/r2-client';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filename = `${timestamp}-${safeName}`;

            if (isR2Configured) {
                // Upload to Cloudflare R2
                const contentType = file.type || 'application/octet-stream';
                
                await r2Client.send(
                    new PutObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: `uploads/${filename}`,
                        Body: buffer,
                        ContentType: contentType,
                    })
                );

                const fileUrl = R2_PUBLIC_URL 
                    ? `${R2_PUBLIC_URL}/uploads/${filename}`
                    : `/api/files/${filename}`;
                
                uploadedUrls.push(fileUrl);
            } else {
                // Check if we are on Vercel or similar read-only environment
                const isProduction = process.env.NODE_ENV === 'production';
                
                if (isProduction) {
                    const missingVars = getMissingR2Vars();
                    throw new Error(`Cloudflare R2 is not configured for production. Missing variables: ${missingVars.join(', ')}`);
                }

                // Local development fallback using os.tmpdir() if public/uploads is unavailable
                let uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                
                try {
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                } catch (e) {
                    console.warn('Could not create public/uploads, falling back to temp dir:', e);
                    uploadsDir = path.join(os.tmpdir(), 'geoinsight-uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                }

                const filePath = path.join(uploadsDir, filename);
                fs.writeFileSync(filePath, buffer);
                uploadedUrls.push(`/uploads/${filename}`);
            }
        }

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 });
    }
}

