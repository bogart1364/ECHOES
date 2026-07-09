import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

// Reliable storage for story audio/cover images. We originally used Irys to
// bundle uploads onto Arweave, but Irys has deprecated that Arweave-bundler
// product in favor of their own datachain — so instead of depending on an
// unreliable, unsupported free-tier service, files are stored via Vercel
// Blob. The story's authenticity and mint timestamp are still anchored
// on-chain via the Solana memo transaction in lib/solana.ts.
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Expected multipart field 'file'" }, { status: 400 });
  }

  const filename = (formData.get("filename") as string) || `upload-${Date.now()}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload] failed:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
