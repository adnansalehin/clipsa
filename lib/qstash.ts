import { Client } from "@upstash/qstash";

const qstashToken = process.env.QSTASH_TOKEN;

// Check if we're using local QStash development server
const isLocalQstash = process.env.QSTASH_LOCAL === "true" ||
    process.env.QSTASH_URL?.includes("127.0.0.1") ||
    qstashToken?.startsWith("eyJVc2VySUQiOiJkZWZhdWx0VXNlciI");

if (!qstashToken && process.env.NODE_ENV === "production") {
    throw new Error("Missing QSTASH_TOKEN environment variable");
}

console.log(`[QSTASH] QSTASH_TOKEN present: ${!!qstashToken}`);
console.log(`[QSTASH] Using local QStash: ${isLocalQstash}`);
console.log(`[QSTASH] QSTASH_URL: ${process.env.QSTASH_URL || 'not set'}`);

export const qstash = qstashToken ? new Client({
    token: qstashToken,
    baseURL: isLocalQstash ? "http://127.0.0.1:8080" : undefined,
}) : null as any; // Mock for development

export const isUsingLocalQstash = isLocalQstash;
