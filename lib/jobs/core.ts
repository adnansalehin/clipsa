import { qstash, isUsingLocalQstash } from "@/lib/qstash";

// Base type for any job payload
export type JobPayload = Record<string, any>;

// The handler function type
export type JobHandler<T extends JobPayload> = (payload: T) => Promise<void>;

// The Job definition type
export interface Job<T extends JobPayload> {
    name: string;
    handler: JobHandler<T>;
}

// Registry to hold all available jobs
export const jobs: Record<string, Job<any>> = {};

const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function getAppUrl() {
    if (process.env.APP_URL) return process.env.APP_URL;
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    if (process.env.DEPLOYMENT_URL) return `https://${process.env.DEPLOYMENT_URL}`;
    return "http://localhost:3000"; // Default fallback for local development
}

function isLoopbackUrl(url: string | null) {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return loopbackHosts.has(hostname);
    } catch {
        return false;
    }
}


/**
 * Factory function to create and register a new background job.
 * @param name Unique name of the job
 * @param handler The function to execute
 */
export function createJob<T extends JobPayload>(
    name: string,
    handler: JobHandler<T>
): Job<T> {
    const job: Job<T> = { name, handler };

    if (jobs[name]) {
        console.warn(`Job with name "${name}" is already registered. Overwriting.`);
    }

    jobs[name] = job;
    return job;
}

/**
 * Dispatches a job to QStash to be executed asynchronously.
 * @param jobName The name of the job to run
 * @param payload The data to pass to the job
 * @param options QStash specific options (delay, etc.)
 */
export async function dispatchJob<T extends JobPayload>(
    jobName: string,
    payload: T,
    options?: { delay?: number }
) {
    const appUrl = getAppUrl();
    const destinationUrl = appUrl ? `${appUrl}/api/jobs` : null;
    const runLocally = async (reason: string) => {
        console.warn(`[JOB] Running ${jobName} locally: ${reason}`);
        const job = jobs[jobName];
        if (job) {
            job.handler(payload).catch(err => console.error(`[JOB] Error running job ${jobName}:`, err));
            return { messageId: 'dev-local' };
        }
        throw new Error(`Job "${jobName}" not found`);
    };

    const shouldBypassQstash = !qstash ||
        !destinationUrl ||
        (isLoopbackUrl(destinationUrl) && !isUsingLocalQstash);

    if (shouldBypassQstash) {
        const reason = !qstash
            ? "QStash not configured"
            : !destinationUrl
                ? "APP_URL not set"
                : `destination ${destinationUrl} resolves to loopback (set APP_URL to a public URL to enable QStash, or use QSTASH_LOCAL=true for local development)`;
        return runLocally(reason);
    }

    console.log(`[JOB] Dispatching ${jobName} via QStash to ${destinationUrl}`);
    return qstash.publishJSON({
        url: destinationUrl,
        body: {
            jobName,
            payload,
        },
        delay: options?.delay,
    });
}
