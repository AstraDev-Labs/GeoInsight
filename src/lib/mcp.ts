import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as Sentry from "@sentry/nextjs";

// Handle potential ESM/CJS interop issues for the wrapper function
const wrapMcpWithSentry = (Sentry as any).wrapMcpServerWithSentry ||
    (Sentry as any).default?.wrapMcpServerWithSentry;

// Initialize Sentry for the standalone process
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
});

/**
 * This is a standalone MCP server that allows AI agents (like Claude Desktop)
 * to interact with your GeoForesight project.
 */
const server = new Server(
    {
        name: "GeoForesight-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "get_latest_posts",
            description: "Get the latest blog posts from GeoForesight",
            inputSchema: {
                type: "object",
                properties: {
                    count: { type: "number", default: 5 },
                },
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_latest_posts") {
        // In a real implementation, you would fetch from your DB here
        return {
            content: [
                {
                    type: "text",
                    text: "GeoForesight Latest Posts: \n1. Introduction to GIS\n2. Modern Web Mapping",
                },
            ],
        };
    }
    throw new Error("Tool not found");
});

// WRAP the server with Sentry for monitoring!
if (typeof wrapMcpWithSentry === "function") {
    wrapMcpWithSentry(server);
} else {
    console.error("Warning: Sentry.wrapMcpServerWithSentry not found in current environment");
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GeoForesight MCP Server running on stdio");
}

main().catch((error) => {
    Sentry.captureException(error);
    console.error("Fatal error in MCP server:", error);
    process.exit(1);
});

