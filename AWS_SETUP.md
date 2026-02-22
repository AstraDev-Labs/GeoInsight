# AWS DynamoDB Setup Guide for RS Blog

To transition from the local simulation to a real AWS backend, follow these steps:

## 1. Create a DynamoDB Table
1.  Log in to your [AWS Management Console](https://console.aws.amazon.com/).
2.  Search for **DynamoDB** and go to the dashboard.
3.  Click **Create table**.
4.  **Table name**: `RSBlogTable` (or matching your `.env.local`).
5.  **Partition key**: `id` (Type: String).
6.  Leave other settings as default and click **Create table**.

## 2. Create an IAM User for Access
1.  Go to the **IAM** (Identity and Access Management) dashboard.
2.  Click **Users** -> **Create user**.
3.  Name it `rs-blog-user`.
4.  In permissions, choose **Attach policies directly**.
5.  Search for and attach: `AmazonDynamoDBFullAccess`.
    *Refinement*: In production, use a custom policy with restricted access to your specific table.
6.  Complete the creation.
7.  Click on the user, go to **Security credentials**, and click **Create access key**.
8.  Choose **Local code** and follow the steps to get your **Access Key ID** and **Secret Access Key**.

## 3. Update your `.env.local`
Create or update `.env.local` in your project root with the credentials you just created:

```env
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
NEXT_PUBLIC_DYNAMODB_TABLE=RSBlogTable
```

## 4. Finalizing the Connection
The code is already prepared in `src/lib/aws-config.ts` to use these environment variables. To fully switch over, we will need to update `src/lib/mock-api.ts` to use the `ddbDocClient` instead of the local simulation.

**Note**: Be careful not to commit your `.env.local` file to GitHub or any public repository.
