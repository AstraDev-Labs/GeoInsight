import { NextResponse } from 'next/server';
import { s3, S3_BUCKET, useAWS } from '@/lib/aws-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';



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

            if (useAWS && s3) {
                // Upload to S3
                const key = `uploads/${filename}`;
                await s3.send(new PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: key,
                    Body: buffer,
                    ContentType: file.type,
                    ContentDisposition: 'inline',
                }));

                // Construct the public URL for the frontend
                let url;
                if (process.env.NEXT_PUBLIC_R2_URL) {
                    // Use custom domain or r2.dev public URL if provided
                    url = `${process.env.NEXT_PUBLIC_R2_URL}/${key}`;
                } else if (process.env.R2_ENDPOINT) {
                    // Fallback to raw endpoint (Note: this often fails in <img> tags due to lack of auth Signature V4)
                    url = `${process.env.R2_ENDPOINT}/${S3_BUCKET}/${key}`;
                } else {
                    const region = process.env.AWS_REGION || 'eu-north-1';
                    url = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
                }
                uploadedUrls.push(url);
            } else {
                // Save locally to public/uploads/
                const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const filePath = path.join(uploadsDir, filename);
                fs.writeFileSync(filePath, buffer);

                // Return a URL that Next.js can serve from /public
                uploadedUrls.push(`/uploads/${filename}`);
            }
        }

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
}


