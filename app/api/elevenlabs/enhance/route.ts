import { NextRequest, NextResponse } from "next/server";
import { isolateVoice } from "@/lib/elevenlabs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Expected multipart field 'audio'" }, { status: 400 });
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const cleaned = await isolateVoice(inputBuffer, file.type || "audio/webm");
    return new NextResponse(new Uint8Array(cleaned), {
      status: 200,
      headers: { "Content-Type": file.type || "audio/webm" },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
