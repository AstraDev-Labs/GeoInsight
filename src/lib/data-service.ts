import { PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, TABLE_NAME, useAWS as awsEnabled } from "./aws-config";
import { BlogPost, PostRequest } from "./types";
import { readDb, writeDb } from "./db-server";

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
