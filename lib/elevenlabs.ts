// Server-side only — never expose ELEVENLABS_API_KEY to the client.
// Uses ElevenLabs' Audio Isolation endpoint to strip background noise
// from a raw recording before it's tokenized and published.

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export async function isolateVoice(audioBuffer: Buffer, mimeType: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Add it to .env.local to enable AI audio cleanup."
    );
  }

  const form = new FormData();
  form.append("audio", new Blob([new Uint8Array(audioBuffer)], { type: mimeType }), "recording");

  const res = await fetch(`${ELEVENLABS_BASE_URL}/audio-isolation`, {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ElevenLabs audio isolation failed: ${res.status} ${detail}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
