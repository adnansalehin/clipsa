import { fal } from "@fal-ai/client";

const falKey = process.env.FAL_KEY;

if (falKey) {
    console.log(`[FAL] Configuring FAL client with provided key`);
    fal.config({
        credentials: falKey,
    });
} else {
    console.warn(`[FAL] FAL_KEY not provided, FAL operations will be mocked`);
}

export { fal };
