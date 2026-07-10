import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set." }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`ElevenLabs voices request failed: ${res.status} ${detail}`);
    }

    const data = await res.json();
    const voices = (data.voices || []).slice(0, 12).map((v: any) => ({
      id: v.voice_id,
      name: v.name,
    }));

    return NextResponse.json({ voices });
  } catch (err) {
    console.error("[api/elevenlabs/voices] failed:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
