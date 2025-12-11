import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

async function handleFalWebhook(req: NextRequest) {
  const body = await req.json();
  console.log(`[WEBHOOK] Received Fal.ai webhook:`, JSON.stringify(body, null, 2));

  const { request_id, status, payload, error } = body;
  const searchParams = req.nextUrl.searchParams;
  const projectId = searchParams.get("projectId");
  const sceneId = searchParams.get("sceneId");
  const type = searchParams.get("type"); // video, audio, image

  if (!projectId) {
    console.error(`[WEBHOOK] Missing projectId in webhook`);
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("clipsa");

  const updateData: any = {
    status: status === "OK" || status === "COMPLETED" ? "succeeded" : status === "ERROR" ? "failed" : status,
    updatedAt: new Date(),
  };

  if (status === "OK" || status === "COMPLETED") {
    updateData.output = payload;
  } else if (status === "ERROR" || error) {
    updateData.error = error;
  }

  let collectionName = "";
  let filter: any = { predictionId: request_id };

  switch (type) {
    case "video":
      collectionName = "scene_generations";
      break;
    case "audio":
      collectionName = "audio_generations";
      break;
    case "image":
      collectionName = "image_generations";
      break;
    default:
      console.warn("Unknown generation type:", type);
      return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  try {
    const result = await db.collection(collectionName).updateOne(filter, { $set: updateData });
    if (result.matchedCount === 0) {
      console.warn(`[WEBHOOK] No record found for prediction ${request_id} in ${collectionName}`);
    }

    if (type === "video" && sceneId) {
      await db.collection("projects").updateOne(
        { _id: new ObjectId(projectId), "scenes.id": sceneId },
        { $set: { "scenes.$.status": updateData.status, updatedAt: new Date() } },
      );
    }

    if (type === "audio") {
      await db.collection("projects").updateOne(
        { _id: new ObjectId(projectId) },
        { $set: { audioStatus: updateData.status, updatedAt: new Date() } },
      );
    }

    const projectObjectId = new ObjectId(projectId);
    const project = await db.collection("projects").findOne({ _id: projectObjectId }, { projection: { scenes: 1, status: 1 } });
    if (project) {
      const totalScenes = Array.isArray(project.scenes) ? project.scenes.length : 0;
      const succeededScenes = await db.collection("scene_generations").countDocuments({
        projectId: projectObjectId,
        status: "succeeded",
      });
      const failedScenes = await db.collection("scene_generations").countDocuments({
        projectId: projectObjectId,
        status: "failed",
      });
      const audioSuccess = await db.collection("audio_generations").findOne({
        projectId: projectObjectId,
        status: "succeeded",
      });

      if (failedScenes > 0) {
        await db.collection("projects").updateOne(
          { _id: projectObjectId },
          { $set: { status: "failed", updatedAt: new Date() } },
        );
      }

      const shouldStitch =
        totalScenes > 0 &&
        succeededScenes === totalScenes &&
        !!audioSuccess &&
        project.status !== "stitching" &&
        project.status !== "completed";

      if (shouldStitch) {
        await db.collection("projects").updateOne(
          { _id: projectObjectId },
          { $set: { status: "stitching", updatedAt: new Date() } },
        );

        const { dispatchJob } = await import("@/lib/jobs/core");
        await dispatchJob("stitch-video", { projectId });
        console.log(`[WEBHOOK] All assets ready, dispatched stitch-video for project ${projectId}`);
      }
    }
  } catch (dbError) {
    console.warn(`[WEBHOOK] MongoDB not available, skipping webhook update:`, dbError);
  }

  return NextResponse.json({ success: true });
}

async function handleElevenLabsWebhook(req: NextRequest) {
  console.log("[WEBHOOK] ElevenLabs webhook received");
  const body = await req.json();
  console.log("[WEBHOOK] ElevenLabs payload:", body);

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const type = searchParams.get("type");

  if (!projectId) {
    console.error("[WEBHOOK] No projectId provided in webhook URL");
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  if (type !== "text-to-speech") {
    console.error(`[WEBHOOK] Unsupported webhook type: ${type}`);
    return NextResponse.json({ error: "Unsupported webhook type" }, { status: 400 });
  }

  // Placeholder: extend to persist audio output if provided
  console.log(`[WEBHOOK] ElevenLabs text-to-speech completed for project ${projectId}`);

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  if (provider === "fal") {
    return handleFalWebhook(req);
  }
  if (provider === "elevenlabs") {
    return handleElevenLabsWebhook(req);
  }
  return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
}
