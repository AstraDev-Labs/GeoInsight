import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as Sentry from "@sentry/nextjs";

// Initialize Sentry for the standalone process
Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
});

/**
 * This is a standalone MCP server that allows AI agents (like Claude Desktop)
 * to interact with your GeoInsight project.
 */
const server = new Server(
    {
        name: "geoinsight-server",
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
            description: "Get the latest blog posts from GeoInsight",
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
                    text: "GeoInsight Latest Posts: \n1. Introduction to GIS\n2. Modern Web Mapping",
                },
            ],
        };
    }
    throw new Error("Tool not found");
});

// WRAP the server with Sentry for monitoring!
// This satisfies the "MCP" requirement in your Sentry dashboard.
Sentry.wrapMcpServerWithSentry(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GeoInsight MCP Server running on stdio");
}

main().catch((error) => {
    Sentry.captureException(error);
    console.error("Fatal error in MCP server:", error);
    process.exit(1);
});
