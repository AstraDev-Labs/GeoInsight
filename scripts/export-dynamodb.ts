/**
 * DynamoDB → Cloudflare D1 Data Export Script
 * 
 * This script connects to your AWS DynamoDB table, reads all items,
 * and generates SQL INSERT statements compatible with the Cloudflare D1 schema.
 * 
 * Usage:
 *   Set your REAL AWS credentials (not R2) before running:
 * 
 *   $env:AWS_REGION="eu-north-1"
 *   $env:AWS_ACCESS_KEY_ID="YOUR_REAL_AWS_KEY"
 *   $env:AWS_SECRET_ACCESS_KEY="YOUR_REAL_AWS_SECRET"
 *   $env:DYNAMODB_TABLE="RSBlogTable"
 *   npx tsx scripts/export-dynamodb.ts
 * 
 *   Or pass them inline:
 *   AWS_REGION=eu-north-1 AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx npx tsx scripts/export-dynamodb.ts
 * 
 * Output: scripts/d1-seed.sql (ready to run with wrangler d1 execute)
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import fs from "fs";
import path from "path";

const region = process.env.AWS_REGION || "eu-north-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const tableName = process.env.DYNAMODB_TABLE || "RSBlogTable";

if (!accessKeyId || !secretAccessKey) {
    console.error("❌ AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required.");
    console.error("Set your real AWS (not R2) credentials before running this script.");
    process.exit(1);
}

// Ensure we're not using R2 credentials
if (region === "auto") {
    console.error("❌ AWS_REGION=auto is for R2. Set a real AWS region like eu-north-1 or us-east-1.");
    process.exit(1);
}

const client = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });
const docClient = DynamoDBDocumentClient.from(client);

function escapeSQL(value: any): string {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "1" : "0";
    const str = String(value).replace(/'/g, "''");
    return `'${str}'`;
}

function escapeJSON(value: any): string {
    if (value === null || value === undefined) return "NULL";
    if (Array.isArray(value) || typeof value === "object") {
        return escapeSQL(JSON.stringify(value));
    }
    return escapeSQL(value);
}

async function scanAll(): Promise<any[]> {
    const items: any[] = [];
    let lastKey: any = undefined;

    do {
        const result = await docClient.send(new ScanCommand({
            TableName: tableName,
            ExclusiveStartKey: lastKey,
        }));
        if (result.Items) items.push(...result.Items);
        lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    return items;
}

function classifyItem(item: any): { type: string; data: any } {
    const id = item.id as string;
    
    if (id.startsWith("comment-user-")) {
        return { type: "comment_user", data: item };
    }
    if (id.startsWith("comment-")) {
        return { type: "comment", data: item };
    }
    if (id.startsWith("sanction-")) {
        return { type: "sanction", data: item };
    }
    if (id.startsWith("post-")) {
        return { type: "post", data: item };
    }
    if (id.startsWith("req-")) {
        return { type: "request", data: item };
    }
    if (id === "bot-settings-global" || id === "bot-settings") {
        return { type: "bot_settings", data: item };
    }
    if (id === "site-settings-global" || id === "site-settings") {
        return { type: "site_settings", data: item };
    }

    // Fallback: try to detect type by fields
    if (item.postId && item.message) return { type: "comment", data: item };
    if (item.commenterKey && item.passwordHash) return { type: "comment_user", data: item };
    if (item.strikes !== undefined) return { type: "sanction", data: item };
    if (item.content && item.postedAt) return { type: "post", data: item };
    if (item.content && item.submittedAt) return { type: "request", data: item };

    return { type: "unknown", data: item };
}

function toPostSQL(item: any): string {
    // Remove the DynamoDB partition key
    const { id: rawId, ...rest } = item;
    const id = rawId.startsWith("post-") ? rawId : rawId;
    
    return `INSERT OR IGNORE INTO posts (id, requestId, editOfId, title, excerpt, content, author, category, date, postedAt, images, status, reviewerNotes, attachments, authorPassword, authorEmail, satellite, areaOfInterest)
VALUES (${escapeSQL(id)}, ${escapeSQL(rest.requestId)}, ${escapeSQL(rest.editOfId)}, ${escapeSQL(rest.title)}, ${escapeSQL(rest.excerpt)}, ${escapeSQL(rest.content)}, ${escapeSQL(rest.author)}, ${escapeSQL(rest.category)}, ${escapeSQL(rest.date)}, ${escapeSQL(rest.postedAt)}, ${escapeJSON(rest.images)}, ${escapeSQL(rest.status)}, ${escapeSQL(rest.reviewerNotes)}, ${escapeJSON(rest.attachments)}, ${escapeSQL(rest.authorPassword)}, ${escapeSQL(rest.authorEmail)}, ${escapeSQL(rest.satellite)}, ${escapeSQL(rest.areaOfInterest)});`;
}

function toRequestSQL(item: any): string {
    const { id, ...rest } = item;
    return `INSERT OR IGNORE INTO requests (id, title, author, email, abstract, content, category, submittedAt, status, images, attachments, authorPassword, satellite, areaOfInterest)
VALUES (${escapeSQL(id)}, ${escapeSQL(rest.title)}, ${escapeSQL(rest.author)}, ${escapeSQL(rest.email)}, ${escapeSQL(rest.abstract)}, ${escapeSQL(rest.content)}, ${escapeSQL(rest.category)}, ${escapeSQL(rest.submittedAt)}, ${escapeSQL(rest.status)}, ${escapeJSON(rest.images)}, ${escapeJSON(rest.attachments)}, ${escapeSQL(rest.authorPassword)}, ${escapeSQL(rest.satellite)}, ${escapeSQL(rest.areaOfInterest)});`;
}

function toCommentSQL(item: any): string {
    const { id, ...rest } = item;
    return `INSERT OR IGNORE INTO comments (id, postId, parentId, authorName, commenterId, commenterKey, message, createdAt, status, moderatedBy, moderatedAt, moderationReason)
VALUES (${escapeSQL(id)}, ${escapeSQL(rest.postId)}, ${escapeSQL(rest.parentId)}, ${escapeSQL(rest.authorName)}, ${escapeSQL(rest.commenterId)}, ${escapeSQL(rest.commenterKey)}, ${escapeSQL(rest.message)}, ${escapeSQL(rest.createdAt)}, ${escapeSQL(rest.status || 'visible')}, ${escapeSQL(rest.moderatedBy)}, ${escapeSQL(rest.moderatedAt)}, ${escapeSQL(rest.moderationReason)});`;
}

function toCommentUserSQL(item: any): string {
    const { id, ...rest } = item;
    return `INSERT OR IGNORE INTO comment_users (userId, commenterKey, name, email, emailVerified, role, passwordHash, emailVerificationCodeHash, emailVerificationExpiresAt, createdAt)
VALUES (${escapeSQL(rest.userId)}, ${escapeSQL(rest.commenterKey)}, ${escapeSQL(rest.name)}, ${escapeSQL(rest.email)}, ${rest.emailVerified ? 1 : 0}, ${escapeSQL(rest.role || 'user')}, ${escapeSQL(rest.passwordHash)}, ${escapeSQL(rest.emailVerificationCodeHash)}, ${escapeSQL(rest.emailVerificationExpiresAt)}, ${escapeSQL(rest.createdAt)});`;
}

function toSanctionSQL(item: any): string {
    const { id, ...rest } = item;
    return `INSERT OR IGNORE INTO comment_sanctions (subjectId, commenterKey, commenterName, strikes, mutedUntil, banned, lastViolationAt, lastReason)
VALUES (${escapeSQL(rest.subjectId || rest.commenterKey)}, ${escapeSQL(rest.commenterKey)}, ${escapeSQL(rest.commenterName)}, ${rest.strikes || 0}, ${escapeSQL(rest.mutedUntil)}, ${rest.banned ? 1 : 0}, ${escapeSQL(rest.lastViolationAt)}, ${escapeSQL(rest.lastReason)});`;
}

function toSettingsSQL(key: string, item: any): string {
    const { id, ...rest } = item;
    return `INSERT OR IGNORE INTO settings (key, value) VALUES (${escapeSQL(key)}, ${escapeSQL(JSON.stringify(rest))});`;
}

async function main() {
    console.log(`📊 Scanning DynamoDB table: ${tableName} (region: ${region})`);
    
    const items = await scanAll();
    console.log(`✅ Found ${items.length} items in DynamoDB`);

    const sql: string[] = [
        "-- Auto-generated D1 seed from DynamoDB export",
        `-- Table: ${tableName}`,
        `-- Exported: ${new Date().toISOString()}`,
        `-- Total items: ${items.length}`,
        "",
    ];

    const counts = { post: 0, request: 0, comment: 0, comment_user: 0, sanction: 0, settings: 0, unknown: 0 };

    for (const item of items) {
        const { type, data } = classifyItem(item);

        switch (type) {
            case "post":
                sql.push(toPostSQL(data));
                counts.post++;
                break;
            case "request":
                sql.push(toRequestSQL(data));
                counts.request++;
                break;
            case "comment":
                sql.push(toCommentSQL(data));
                counts.comment++;
                break;
            case "comment_user":
                sql.push(toCommentUserSQL(data));
                counts.comment_user++;
                break;
            case "sanction":
                sql.push(toSanctionSQL(data));
                counts.sanction++;
                break;
            case "bot_settings":
                sql.push(toSettingsSQL("bot-settings", data));
                counts.settings++;
                break;
            case "site_settings":
                sql.push(toSettingsSQL("site-settings", data));
                counts.settings++;
                break;
            default:
                sql.push(`-- UNKNOWN ITEM (id=${data.id}): ${JSON.stringify(data)}`);
                counts.unknown++;
                break;
        }
    }

    const outPath = path.join(process.cwd(), "scripts", "d1-seed.sql");
    fs.writeFileSync(outPath, sql.join("\n") + "\n");

    console.log(`\n📝 SQL written to: ${outPath}`);
    console.log(`   Posts: ${counts.post}`);
    console.log(`   Requests: ${counts.request}`);
    console.log(`   Comments: ${counts.comment}`);
    console.log(`   Users: ${counts.comment_user}`);
    console.log(`   Sanctions: ${counts.sanction}`);
    console.log(`   Settings: ${counts.settings}`);
    if (counts.unknown > 0) console.log(`   ⚠️ Unknown: ${counts.unknown}`);
    console.log(`\n🚀 Next step:`);
    console.log(`   npx wrangler d1 execute geoinsight-db --file=scripts/d1-seed.sql`);
}

main().catch((err) => {
    console.error("❌ Export failed:", err);
    process.exit(1);
});
