import { NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, isR2Configured } from '@/lib/r2-client';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        if (!isR2Configured) {
            return NextResponse.json({ error: 'Cloudflare R2 is not configured.' }, { status: 400 });
        }

        interface PresignBody {
            filename?: string;
            contentType?: string;
        }

        const body = (await request.json()) as PresignBody;
        const { filename, contentType } = body;

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Filename and contentType are required' }, { status: 400 });
        }

        // Generate safe unique filename
        const timestamp = Date.now();
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const r2Filename = `${timestamp}-${safeName}`;
        const key = `uploads/${r2Filename}`;

        // Create PutObject command
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        // Generate presigned URL (expires in 600 seconds = 10 minutes)
        const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });

        const publicUrl = R2_PUBLIC_URL 
            ? `${R2_PUBLIC_URL}/${key}`
            : `/api/files/${r2Filename}`;

        return NextResponse.json({
            uploadUrl,
            publicUrl,
        });
    } catch (error) {
        console.error('Presign error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: `Failed to generate upload URL: ${errorMessage}` }, { status: 500 });
    }
}
