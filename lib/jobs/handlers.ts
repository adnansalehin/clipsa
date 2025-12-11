import { createJob } from "./core";
import { fal } from "@/lib/fal";
import clientPromise from "@/lib/mongodb";
import { GridFSBucket, ObjectId } from "mongodb";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "node:fs";
import { promises as fsPromises } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic as string);
}

// --- Types ---

interface VideoGenerationPayload {
    projectId: string; // The ID of the project in MongoDB
    scenes: {
        id: string;
        text: string;
        image?: string; // Optional image prompt
    }[];
    audioSettings?: {
        mood?: string;
        narration?: string;
        voiceStyle?: string;
    };
    videoSettings?: {
        totalDuration?: number;
    };
}

interface SceneVideoPayload {
    projectId: string;
    sceneId: string;
    prompt: string;
    imageUrl?: string;
}

interface AudioGenerationPayload {
    projectId: string;
    prompt: string;
    duration: number;
}

interface ImageGenerationPayload {
    projectId: string;
    prompt: string;
}

interface StitchVideoPayload {
    projectId: string;
}

function resolveOutputUrl(output: any): string | undefined {
    if (!output) return undefined;
    if (typeof output === "string") return output;
    return (
        output.video?.url ||
        output.video_url ||
        output.url ||
        output.audio?.url ||
        output.output_url ||
        (Array.isArray(output.output) ? output.output[0]?.url || output.output[0] : undefined) ||
        output.file ||
        output.href
    );
}

async function downloadToFile(url: string, targetPath: string) {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to download asset from ${url}: ${response.statusText}`);
    }
    await pipeline(response.body as any, fs.createWriteStream(targetPath));
    return targetPath;
}

// --- Handlers ---

export const startVideoGeneration = createJob<VideoGenerationPayload>(
    "start-video-generation",
    async ({ projectId, scenes, audioSettings, videoSettings }) => {
        console.log(`Starting video generation for project ${projectId} with ${scenes.length} scenes`);

        const client = await clientPromise;
        const db = client.db("clipsa");
        await db.collection("projects").updateOne(
            { _id: new ObjectId(projectId) },
            { $set: { status: "processing", updatedAt: new Date() } }
        );

        const { dispatchJob } = await import("./core");

        const sceneJobs = scenes.map((scene) =>
            dispatchJob("process-scene-video", {
                projectId,
                sceneId: scene.id,
                prompt: scene.text,
                imageUrl: scene.image
            })
        );

        // Kick off audio generation in parallel
        const audioPrompt =
            audioSettings?.narration ||
            `Soundtrack with mood "${audioSettings?.mood || "cinematic"}" for scenes: ${scenes
                .map((s) => s.text)
                .join(". ")}`;
        const totalDuration =
            videoSettings?.totalDuration ||
            Math.max(
                1,
                Math.round(
                    Array.isArray(scenes)
                        ? scenes.reduce((sum, s) => sum + (Number((s as any).duration) || 0), 0)
                        : 0
                )
            );

        const audioJob = dispatchJob("process-audio", {
            projectId,
            prompt: audioPrompt,
            duration: totalDuration
        });

        await Promise.all([...sceneJobs, audioJob]);
    }
);

export const processSceneVideo = createJob<SceneVideoPayload>(
    "process-scene-video",
    async ({ projectId, sceneId, prompt, imageUrl }) => {
        console.log(`Processing scene ${sceneId} for project ${projectId}`);

        const client = await clientPromise;
        const db = client.db("clipsa");
        const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const webhookUrl = `${appUrl}/api/webhooks/fal?projectId=${projectId}&sceneId=${sceneId}&type=video`;

        const input: any = {
            prompt: prompt,
        };
        if (imageUrl) {
            input.image_url = imageUrl;
        }

        await db.collection("projects").updateOne(
            { _id: new ObjectId(projectId), "scenes.id": sceneId },
            { $set: { "scenes.$.status": "processing", updatedAt: new Date() } }
        );

        // Using Fal.ai VEO 3.1 model
        const prediction = await fal.queue.submit("fal-ai/veo-3.1", {
            input,
            webhookUrl: webhookUrl,
        });

        await db.collection("scene_generations").insertOne({
            projectId: new ObjectId(projectId),
            sceneId,
            predictionId: prediction.request_id,
            status: "pending",
            createdAt: new Date(),
            type: "video"
        });
    }
);

export const processAudio = createJob<AudioGenerationPayload>(
    "process-audio",
    async ({ projectId, prompt, duration }) => {
        console.log(`Generating audio for project ${projectId}`);
        const client = await clientPromise;
        const db = client.db("clipsa");
        const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const webhookUrl = `${appUrl}/api/webhooks/fal?projectId=${projectId}&type=audio`;

        await db.collection("projects").updateOne(
            { _id: new ObjectId(projectId) },
            { $set: { audioStatus: "processing", updatedAt: new Date() } }
        );

        // Example audio model
        const prediction = await fal.queue.submit("fal-ai/stable-audio", {
            input: {
                prompt: prompt,
                seconds_total: duration || 10
            },
            webhookUrl: webhookUrl,
        });

        await db.collection("audio_generations").insertOne({
            projectId: new ObjectId(projectId),
            predictionId: prediction.request_id,
            status: "pending",
            createdAt: new Date(),
            type: "audio"
        });
    }
);

export const stitchVideo = createJob<StitchVideoPayload>(
    "stitch-video",
    async ({ projectId }) => {
        console.log(`[STITCH] Starting stitch job for project ${projectId}`);
        const client = await clientPromise;
        const db = client.db("clipsa");
        const projectObjectId = new ObjectId(projectId);
        const project = await db.collection("projects").findOne({ _id: projectObjectId });

        if (!project) {
            console.warn(`[STITCH] Project ${projectId} not found`);
            return;
        }

        const scenes = Array.isArray(project.scenes) ? project.scenes : [];
        const sceneResults = await db.collection("scene_generations")
            .find({ projectId: projectObjectId, status: "succeeded" })
            .toArray();
        const audioResult = await db.collection("audio_generations")
            .findOne({ projectId: projectObjectId, status: "succeeded" });

        if (!audioResult || !audioResult.output) {
            throw new Error(`[STITCH] Missing audio output for project ${projectId}`);
        }

        const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), "clipsa-stitch-"));
        const cleanup = async () => {
            try {
                const files = await fsPromises.readdir(tmpDir);
                await Promise.all(files.map((file) => fsPromises.rm(path.join(tmpDir, file), { force: true })));
                await fsPromises.rmdir(tmpDir);
            } catch (err) {
                console.warn("[STITCH] Cleanup failed", err);
            }
        };

        try {
            const scenePaths: string[] = [];
            for (const scene of scenes) {
                const match = sceneResults.find((s) => s.sceneId === scene.id);
                const url = resolveOutputUrl(match?.output);
                if (!match || !url) {
                    throw new Error(`[STITCH] Missing output for scene ${scene.id}`);
                }
                const target = path.join(tmpDir, `${scene.id}.mp4`);
                await downloadToFile(url, target);
                scenePaths.push(target);
            }

            const audioUrl = resolveOutputUrl(audioResult.output);
            if (!audioUrl) {
                throw new Error(`[STITCH] Could not resolve audio output URL for project ${projectId}`);
            }
            const audioPath = path.join(tmpDir, "audio.mp3");
            await downloadToFile(audioUrl, audioPath);

            const listFile = path.join(tmpDir, "videos.txt");
            const listContent = scenePaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
            await fsPromises.writeFile(listFile, listContent, "utf8");

            const mergedVideoPath = path.join(tmpDir, "merged.mp4");
            await new Promise<void>((resolve, reject) => {
                ffmpeg()
                    .input(listFile)
                    .inputOptions(["-f", "concat", "-safe", "0"])
                    .outputOptions(["-c", "copy"])
                    .on("end", () => resolve())
                    .on("error", reject)
                    .save(mergedVideoPath);
            });

            const finalPath = path.join(tmpDir, "final.mp4");
            await new Promise<void>((resolve, reject) => {
                ffmpeg()
                    .input(mergedVideoPath)
                    .input(audioPath)
                    .outputOptions(["-c:v", "copy", "-c:a", "aac", "-shortest"])
                    .on("end", () => resolve())
                    .on("error", reject)
                    .save(finalPath);
            });

            const bucket = new GridFSBucket(db, { bucketName: "media" });
            const uploadStream = bucket.openUploadStream(`video-${projectId}.mp4`, {
                metadata: { projectId },
            });
            await pipeline(fs.createReadStream(finalPath), uploadStream);

            const finalId = uploadStream.id.toString();
            const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const finalUrl = `${appUrl}/api/media/${finalId}`;

            await db.collection("projects").updateOne(
                { _id: projectObjectId },
                {
                    $set: {
                        status: "completed",
                        updatedAt: new Date(),
                        assets: {
                            finalVideoId: finalId,
                            finalVideoUrl: finalUrl,
                        },
                    },
                }
            );

            console.log(`[STITCH] Completed project ${projectId}, stored video ${finalId}`);
        } catch (error) {
            console.error(`[STITCH] Failed for project ${projectId}:`, error);
            await db.collection("projects").updateOne(
                { _id: projectObjectId },
                { $set: { status: "failed", error: (error as Error).message, updatedAt: new Date() } }
            );
            throw error;
        } finally {
            await cleanup();
        }
    }
);

export const processImage = createJob<ImageGenerationPayload>(
    "process-image",
    async ({ projectId, prompt }) => {
        console.log(`Generating image for project ${projectId}`);
        const appUrl = process.env.APP_URL;
        const webhookUrl = `${appUrl}/api/webhooks/fal?projectId=${projectId}&type=image`;

        // Using Flux Dev model
        const prediction = await fal.queue.submit("fal-ai/flux/dev", {
            input: {
                prompt: prompt,
            },
            webhookUrl: webhookUrl,
        });

        const client = await clientPromise;
        const db = client.db("clipsa");
        await db.collection("image_generations").insertOne({
            projectId: new ObjectId(projectId),
            predictionId: prediction.request_id,
            status: "pending",
            createdAt: new Date(),
            type: "image"
        });
    }
);
