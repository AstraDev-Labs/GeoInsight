import { PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME, useAWS as awsEnabled, s3, S3_BUCKET } from "./aws-config";
import { BlogPost, PostRequest } from "./types";
import { readDb, writeDb } from "./db-server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

export const dataService = {
    // Requests
    getRequests: async (): Promise<PostRequest[]> => {
        if (awsEnabled && ddbDocClient) {
            try {
                const result = await ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(id, :prefix)",
                    ExpressionAttributeValues: { ":prefix": "req-" }
                }));
                return (result.Items as PostRequest[]) || [];
            } catch (error) {
                console.error("AWS DynamoDB getRequests failed, falling back to local DB:", error);
                return readDb().requests;
            }
        } else {
            return readDb().requests;
        }
    },

    addRequest: async (request: PostRequest): Promise<void> => {
        if (awsEnabled && ddbDocClient) {
            try {
                await ddbDocClient.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: request
                }));
            } catch (error) {
                console.error("AWS DynamoDB addRequest failed, falling back to local DB:", error);
                const db = readDb();
                db.requests.push(request);
                writeDb(db);
            }
        } else {
            const db = readDb();
            db.requests.push(request);
            writeDb(db);
        }
    },

    updateRequest: async (updatedRequest: PostRequest): Promise<void> => {
        if (awsEnabled && ddbDocClient) {
            try {
                await ddbDocClient.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: updatedRequest
                }));
            } catch (error) {
                console.error("AWS DynamoDB updateRequest failed, falling back to local DB:", error);
                const db = readDb();
                const index = db.requests.findIndex(r => r.id === updatedRequest.id);
                if (index !== -1) {
                    db.requests[index] = updatedRequest;
                    writeDb(db);
                }
            }
        } else {
            const db = readDb();
            const index = db.requests.findIndex(r => r.id === updatedRequest.id);
            if (index !== -1) {
                db.requests[index] = updatedRequest;
                writeDb(db);
            }
        }
    },

    // Posts
    getPosts: async (): Promise<BlogPost[]> => {
        if (awsEnabled && ddbDocClient) {
            try {
                const result = await ddbDocClient.send(new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(id, :prefix)",
                    ExpressionAttributeValues: { ":prefix": "post-" }
                }));
                return (result.Items as BlogPost[]) || [];
            } catch (error) {
                console.error("AWS DynamoDB getPosts failed, falling back to local DB:", error);
                return readDb().posts;
            }
        } else {
            return readDb().posts;
        }
    },

    savePost: async (post: BlogPost): Promise<void> => {
        if (awsEnabled && ddbDocClient) {
            try {
                await ddbDocClient.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: post
                }));
            } catch (error) {
                console.error("AWS DynamoDB savePost failed, falling back to local DB:", error);
                const db = readDb();
                const index = db.posts.findIndex(p => p.id === post.id);
                if (index !== -1) {
                    db.posts[index] = post;
                } else {
                    db.posts.push(post);
                }
                writeDb(db);
            }
        } else {
            const db = readDb();
            const index = db.posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                db.posts[index] = post;
            } else {
                db.posts.push(post);
            }
            writeDb(db);
        }
    },

    deletePost: async (id: string): Promise<void> => {
        // 1. Fetch the post first to identify associated files
        const posts = await dataService.getPosts();
        const post = posts.find(p => p.id === id);

        if (!post) return;

        // 2. Clear files from S3 or Local storage
        const filesToDelete = [...(post.images || []), ...(post.attachments || [])];

        for (const fileUrl of filesToDelete) {
            try {
                if (awsEnabled && ddbDocClient && s3 && fileUrl.startsWith('https://')) {
                    // Extract S3 Key from URL
                    // Format: https://bucket.s3.region.amazonaws.com/key
                    const s3UrlParts = fileUrl.split('.amazonaws.com/');
                    if (s3UrlParts.length > 1) {
                        const key = s3UrlParts[1];
                        console.log(`🗑️ Deleting S3 object: ${key}`);
                        await s3.send(new DeleteObjectCommand({
                            Bucket: S3_BUCKET,
                            Key: key
                        }));
                    }
                } else if (fileUrl.startsWith('/uploads/')) {
                    // Delete local file
                    const filename = fileUrl.replace('/uploads/', '');
                    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                    if (fs.existsSync(filePath)) {
                        console.log(`🗑️ Deleting local file: ${filename}`);
                        fs.unlinkSync(filePath);
                    }
                }
            } catch (err) {
                console.error(`Failed to delete file ${fileUrl}:`, err);
            }
        }

        // 3. Delete from Database
        if (awsEnabled && ddbDocClient) {
            try {
                const { DeleteCommand } = await import("@aws-sdk/lib-dynamodb");
                await ddbDocClient.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { id }
                }));
            } catch (error) {
                console.error("AWS DynamoDB deletePost failed, falling back to local DB:", error);
                const db = readDb();
                db.posts = db.posts.filter(p => p.id !== id);
                writeDb(db);
            }
        } else {
            const db = readDb();
            db.posts = db.posts.filter(p => p.id !== id);
            writeDb(db);
        }
    },

    deleteRequest: async (id: string): Promise<void> => {
        if (awsEnabled && ddbDocClient) {
            try {
                const { DeleteCommand } = await import("@aws-sdk/lib-dynamodb");
                await ddbDocClient.send(new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { id }
                }));
            } catch (error) {
                console.error("AWS DynamoDB deleteRequest failed, falling back to local DB:", error);
                const db = readDb();
                db.requests = db.requests.filter(r => r.id !== id);
                writeDb(db);
            }
        } else {
            const db = readDb();
            db.requests = db.requests.filter(r => r.id !== id);
            writeDb(db);
        }
    },

    clearHistory: async (): Promise<void> => {
        try {
            // 1. Get current data for identification
            const allRequests = await dataService.getRequests() || [];
            const allPosts = await dataService.getPosts() || [];

            // 2. Clear Local JSON DB (Safe sync operation)
            const db = readDb() || { posts: [], requests: [] };
            const safeRequests = Array.isArray(db.requests) ? db.requests : [];
            const safePosts = Array.isArray(db.posts) ? db.posts : [];

            db.requests = safeRequests.filter((r: any) => r.status === 'pending');
            db.posts = safePosts.filter((p: any) => p.status !== 'rejected');
            writeDb(db);

            // 3. Clear AWS DynamoDB if active
            if (awsEnabled && ddbDocClient) {
                const client = ddbDocClient; // Capture non-null reference

                // Identify items to delete
                const requestsToDelete = allRequests.filter(r => r.status !== 'pending');
                const postsToDelete = allPosts.filter(p => p.status === 'rejected');

                console.log(`🧹 Clearing ${requestsToDelete.length} requests and ${postsToDelete.length} rejected posts from AWS...`);

                // Parallel execution for speed (within limits)
                const deletePromises = [
                    ...requestsToDelete.map(req =>
                        client.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: req.id } }))
                    ),
                    ...postsToDelete.map(post =>
                        client.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id: post.id } }))
                    )
                ];

                await Promise.all(deletePromises);
            }
        } catch (error: any) {
            console.error("CRITICAL: clearHistory failed:", error);
            throw new Error(error.message || "Failed to execute database purge");
        }
    },
};
