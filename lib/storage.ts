/**
 * Uploads a file (audio recording or cover image) to reliable storage.
 *
 * We originally bundled uploads onto Arweave via Irys, but Irys has
 * deprecated that Arweave-bundler product in favor of their own datachain,
 * and their old devnet bundler was consequently unreliable (timeouts,
 * "confirmed tx not found" errors) — a dead end, not something fixable on
 * our end. Files are now stored via Vercel Blob instead. The story's
 * authorship and mint timestamp are still anchored for real on Solana via
 * the memo transaction in lib/solana.ts.
 */
export async function uploadFile(blob: Blob, filename: string): Promise<string> {
  const form = new FormData();
  form.append("file", blob, filename);
  form.append("filename", filename);

  const res = await fetch("/api/upload", { method: "POST", body: form });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || "Upload failed");
  }

  const { url } = await res.json();
  return url as string;
}

export const uploadAudio = (blob: Blob) => {
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
  return uploadFile(blob, `audio-${Date.now()}.${ext}`);
};
export const uploadImage = (file: File) => uploadFile(file, `cover-${Date.now()}-${file.name}`);
