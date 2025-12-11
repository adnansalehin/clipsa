import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { dispatchJob } from "@/lib/jobs/core";
import "@/lib/jobs/handlers";

interface ImageGenerationRequestBody {
  prompt: string;
  sourceImageUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ImageGenerationRequestBody = await req.json();
    const { prompt } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let projectId: string;

    try {
      const client = await clientPromise;
      const db = client.db("clipsa");

      const result = await db.collection("projects").insertOne({
        type: "image",
        prompt,
        sourceImageUrl: body.sourceImageUrl,
        status: "created",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      projectId = result.insertedId.toHexString();
    } catch (dbError) {
      console.warn("[API] MongoDB not available for image generation, using mock project ID:", dbError);
      projectId = new ObjectId().toHexString();
    }

    await dispatchJob("process-image", {
      projectId,
      prompt,
    });

    return NextResponse.json({
      success: true,
      projectId,
      message: "Image generation started successfully",
    });
  } catch (error) {
    console.error("[API] Error creating image generation request:", error);
    return NextResponse.json(
      {
        error: "Failed to start image generation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
