import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("[API] Generating ElevenLabs Scribe token");

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      console.error("[API] ELEVENLABS_API_KEY not configured");
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text/get-realtime-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          model_id: "scribe_v2_realtime",
          ttl_secs: 300, // 5 minutes
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] ElevenLabs API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Failed to generate Scribe token: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.token) {
      console.error("[API] No token received from ElevenLabs");
      return NextResponse.json(
        { error: "No token received from ElevenLabs" },
        { status: 500 }
      );
    }

    console.log("[API] Scribe token generated successfully");

    return NextResponse.json({
      token: data.token,
      expiresAt: Date.now() + (300 * 1000), // 5 minutes from now
    });

  } catch (error) {
    console.error("[API] Error generating Scribe token:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Scribe token",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}