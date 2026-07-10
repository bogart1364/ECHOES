import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text, voiceId } = await req.json();

  if (!text?.trim() || !voiceId) {
    return NextResponse.json({ error: "Expected { text, voiceId }" }, { status: 400 });
  }
  if (text.length > 2500) {
    return NextResponse.json({ error: "Keep the script under 2500 characters." }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set." }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`ElevenLabs narration failed: ${res.status} ${detail}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (err) {
    console.error("[api/elevenlabs/narrate] failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
