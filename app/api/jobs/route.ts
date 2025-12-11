import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/dist/nextjs";
import { jobs } from "@/lib/jobs/core";
import "@/lib/jobs/handlers"; // Import to register jobs

async function handler(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobName, payload } = body;

        console.log(`Received job: ${jobName}`);

        if (!jobName || !jobs[jobName]) {
            console.error(`Job "${jobName}" not found`);
            return NextResponse.json({ error: `Job "${jobName}" not found` }, { status: 404 });
        }

        const job = jobs[jobName];
        await job.handler(payload);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// In development, you might want to bypass signature verification for easy testing
// using a tool like Postman or curl.
const shouldVerify = process.env.NODE_ENV === "production" || process.env.VERIFY_QSTASH_IN_DEV === "true";

export const POST = shouldVerify ? verifySignatureAppRouter(handler) : handler;
