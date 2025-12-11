import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { dispatchJob, getAppUrl } from "@/lib/jobs/core";
import "@/lib/jobs/handlers";

export const runtime = "nodejs";

interface VideoGenerationRequest {
  scenes: {
    id: string;
    description: string;
    duration?: number;
    motion?: string;
    transition?: string;
    inputImageId?: string;
  }[];
  audioSettings?: {
    mood?: string;
    narration?: string;
    voiceStyle?: string;
  };
  videoSettings?: {
    aspectRatio?: string;
    totalDuration?: number;
  };
}

function buildMediaUrl(id?: string | null) {
  if (!id) return undefined;
  const appUrl = getAppUrl();
  return `${appUrl}/api/media/${id}`;
}

function normalizeScenes(scenes: VideoGenerationRequest["scenes"]) {
  return scenes.map((scene, index) => ({
    id: scene.id || `scene-${index}`,
    description: scene.description?.trim() || "",
    duration: Number(scene.duration ?? 5),
    motion: scene.motion || "static",
    transition: scene.transition || "fade",
    inputImageId: scene.inputImageId,
    inputImageUrl: buildMediaUrl(scene.inputImageId),
    status: "pending" as const,
  }));
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const id = slug[0];
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("clipsa");
    const projectObjectId = new ObjectId(id);

    const project = await db.collection("projects").findOne({ _id: projectObjectId });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const sceneGenerations = await db
      .collection("scene_generations")
      .find({ projectId: projectObjectId })
      .toArray();
    const audioGeneration = await db
      .collection("audio_generations")
      .findOne({ projectId: projectObjectId });

    const sceneStatusMap = new Map<string, { status?: string; outputUrl?: string }>();
    sceneGenerations.forEach((entry) => {
      sceneStatusMap.set(entry.sceneId, {
        status: entry.status,
        outputUrl: resolveOutputUrl(entry.output),
      });
    });

    const scenes = Array.isArray(project.scenes)
      ? project.scenes.map((scene: any) => ({
          id: scene.id,
          description: scene.description,
          duration: scene.duration,
          motion: scene.motion,
          transition: scene.transition,
          inputImageId: scene.inputImageId,
          inputImageUrl: scene.inputImageUrl,
          status: sceneStatusMap.get(scene.id)?.status || scene.status,
          outputUrl: sceneStatusMap.get(scene.id)?.outputUrl,
        }))
      : [];

    const responsePayload = {
      id: project._id.toString(),
      status: project.status,
      audioStatus: project.audioStatus,
      assets: project.assets,
      scenes,
      audio: audioGeneration
        ? {
            status: audioGeneration.status,
            outputUrl: resolveOutputUrl(audioGeneration.output),
          }
        : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return NextResponse.json({ project: responsePayload });
  } catch (error) {
    console.error("[API] Failed to load project", error);
    return NextResponse.json(
      { error: "Failed to load project", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  console.log("[API] Received video generation request");

  try {
    const body: VideoGenerationRequest = await req.json();
    const { scenes = [], audioSettings = {}, videoSettings = {} } = body || {};

    if (!Array.isArray(scenes) || scenes.length === 0) {
      console.error("[API] No scenes provided");
      return NextResponse.json({ error: "At least one scene is required" }, { status: 400 });
    }

    const normalizedScenes = normalizeScenes(scenes);
    const totalDuration =
      videoSettings.totalDuration && videoSettings.totalDuration > 0
        ? videoSettings.totalDuration
        : normalizedScenes.reduce((sum, scene) => sum + (scene.duration || 0), 0);

    let projectId: string;

    try {
      const client = await clientPromise;
      const db = client.db("clipsa");

      const now = new Date();
      const projectData = {
        _id: new ObjectId(),
        scenes: normalizedScenes,
        audioSettings,
        videoSettings: {
          ...videoSettings,
          totalDuration,
        },
        status: "created",
        assets: {
          finalVideoId: null as string | null,
          finalVideoUrl: null as string | null,
        },
        createdAt: now,
        updatedAt: now,
      };

      console.log(`[API] Creating project with ID: ${projectData._id}`);

      const result = await db.collection("projects").insertOne(projectData);
      projectId = result.insertedId.toString();
    } catch (dbError) {
      console.warn(`[API] MongoDB not available, using mock project ID:`, dbError);
      projectId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[API] Using mock project ID: ${projectId}`);
    }

    console.log(`[API] Project created successfully: ${projectId}`);

    const jobScenes = normalizedScenes.map((scene) => ({
      id: scene.id,
      text: scene.description,
      image: scene.inputImageUrl,
      duration: scene.duration,
    }));

    console.log(`[API] Dispatching video generation job for project ${projectId}`);

    await dispatchJob("start-video-generation", {
      projectId,
      scenes: jobScenes,
      audioSettings,
      videoSettings: { totalDuration },
    });

    console.log(`[API] Video generation job dispatched successfully`);

    return NextResponse.json({
      success: true,
      projectId,
      message: "Video generation started successfully",
    });
  } catch (error) {
    console.error("[API] Error creating video generation project:", error);
    return NextResponse.json(
      {
        error: "Failed to start video generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
