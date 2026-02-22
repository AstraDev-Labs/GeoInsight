import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "eu-north-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "AKIAVG4IOLXY3TN4UDPC";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "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";

console.log("Region:", region);
console.log("AccessKeyId:", accessKeyId);

const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
});
const docClient = DynamoDBDocumentClient.from(client);

async function test() {
    try {
        const result = await docClient.send(new ScanCommand({
            TableName: "RSBlogTable"
        }));
        console.log("Success! Items:", JSON.stringify(result.Items, null, 2));
    } catch (err: any) {
        console.error("AWS Error:", err.message);
    }
}
test();
