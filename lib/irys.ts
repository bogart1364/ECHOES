// Client-side permanent storage upload via Irys (formerly Bundlr).
// The listener's own connected Solana wallet is used as the signer/funder,
// so no server-held private key is required for the common case.
//
// NOTE: Irys's browser SDK expects a wallet adapter-compatible provider.
// This wraps that flow and is intentionally isolated here so it's the
// one file to touch if you swap providers (e.g. a server-funded node
// via IRYS_SERVER_PRIVATE_KEY instead).

import type { WalletContextState } from "@solana/wallet-adapter-react";

export async function uploadToArweave(blob: Blob, wallet: WalletContextState): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Connect a wallet before publishing.");
  }

  const { WebIrys } = await import("@irys/sdk");

  console.log("[irys] initializing WebIrys…", {
    network: process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet" : "devnet",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  });

  const irys = new WebIrys({
    network: process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet" : "devnet",
    token: "solana",
    wallet: { rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL, name: "solana", provider: wallet },
  });

  await withTimeout(irys.ready(), 20000, "Connecting to Irys timed out after 20s.");
  console.log("[irys] ready. address:", irys.address);

  const buffer = Buffer.from(await blob.arrayBuffer());

  const price = await withTimeout(
    irys.getPrice(buffer.length),
    15000,
    "Fetching Irys upload price timed out after 15s."
  );
  console.log("[irys] price for", buffer.length, "bytes:", price.toString());

  await fundWithRetry(irys, price);
  console.log("[irys] funded.");

  const receipt = await withTimeout(
    irys.upload(buffer, { tags: [{ name: "Content-Type", value: blob.type || "application/octet-stream" }] }),
    45000,
    "Uploading to Irys timed out after 45s. The file may be too large, or Irys's devnet node may be unresponsive."
  );
  console.log("[irys] uploaded. id:", receipt.id);

  return `https://gateway.irys.xyz/${receipt.id}`;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * irys.fund() occasionally fails with "Confirmed tx not found" even though
 * the funding transaction did land on-chain — the Irys node just checked
 * before the public devnet RPC had propagated it. Retrying after a short
 * wait almost always succeeds once the network catches up.
 */
async function fundWithRetry(irys: any, price: any, attempts = 3): Promise<void> {
  for (let i = 1; i <= attempts; i++) {
    try {
      await withTimeout(irys.fund(price), 60000, "Funding Irys timed out after 60s — check your wallet for a stuck approval.");
      return;
    } catch (err) {
      const message = (err as Error).message || "";
      const isPropagationDelay =
        message.includes("Confirmed tx not found") || message.includes("failed to post funding");

      console.warn(`[irys] fund attempt ${i}/${attempts} failed:`, message);

      if (!isPropagationDelay || i === attempts) throw err;

      const waitMs = 4000 * i;
      console.log(`[irys] retrying fund in ${waitMs}ms (likely RPC propagation delay, not a real failure)…`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

// Kept as a thin alias — existing callers referring to "audio" specifically
// still read clearly, but both go through the same generic uploader above.
export const uploadAudioToArweave = uploadToArweave;
export const uploadImageToArweave = uploadToArweave;
