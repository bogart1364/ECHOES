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

  const irys = new WebIrys({
    network: process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet" : "devnet",
    token: "solana",
    wallet: { rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL, name: "solana", provider: wallet },
  });

  await irys.ready();

  const buffer = Buffer.from(await blob.arrayBuffer());

  // Fund just enough for this upload. On devnet this is effectively free.
  const price = await irys.getPrice(buffer.length);
  await irys.fund(price);

  const receipt = await irys.upload(buffer, {
    tags: [{ name: "Content-Type", value: blob.type || "application/octet-stream" }],
  });

  return `https://gateway.irys.xyz/${receipt.id}`;
}

// Kept as a thin alias — existing callers referring to "audio" specifically
// still read clearly, but both go through the same generic uploader above.
export const uploadAudioToArweave = uploadToArweave;
export const uploadImageToArweave = uploadToArweave;
