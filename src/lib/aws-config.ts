import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

// Set USE_AWS=true in .env.local to enable DynamoDB + S3
// Without NEXT_PUBLIC_ prefix, these stay server-side only (more secure)
const useAWSFlag = process.env.USE_AWS === "true";
const region = process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

let dynamoClient: DynamoDBClient | null = null;
let s3Client: S3Client | null = null;

if (useAWSFlag && accessKeyId && secretAccessKey) {
    const credentials = { accessKeyId, secretAccessKey };

    dynamoClient = new DynamoDBClient({ region, credentials });
    s3Client = new S3Client({ region, credentials });

    console.log("✅ AWS DynamoDB + S3 clients initialized.");
} else {
    console.log("📁 Using local storage. Set USE_AWS=true in .env.local to enable AWS.");
}

export const ddbDocClient = dynamoClient ? DynamoDBDocumentClient.from(dynamoClient) : null;
export const s3 = s3Client;
export const TABLE_NAME = process.env.DYNAMODB_TABLE || "RSBlogTable";
export const S3_BUCKET = process.env.S3_BUCKET || "rs-blog-uploads";
export const useAWS = useAWSFlag;
