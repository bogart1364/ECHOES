import { Connection, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export function getConnection() {
  return new Connection(SOLANA_RPC_URL, "confirmed");
}

// Memo Program — the cheapest, simplest way to write permanent, verifiable
// data to Solana without deploying a custom program. We use it to anchor
// each story's metadata (title + Arweave URI) on-chain at mint time.
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export interface StoryMintMemo {
  type: "echoes.story.mint";
  title: string;
  arweaveUri: string;
  imageUri?: string;
  durationSeconds: number;
  createdAt: string;
}

/**
 * Builds (but does not send) a transaction that writes the story's
 * metadata to Solana via the Memo program. The connected wallet is
 * expected to sign and send this — see components/WaveformRecorder.tsx.
 */
export async function buildStoryMintTransaction(
  connection: Connection,
  payer: PublicKey,
  memo: StoryMintMemo
): Promise<Transaction> {
  const memoInstruction = new TransactionInstruction({
    keys: [{ pubkey: payer, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(JSON.stringify(memo), "utf-8"),
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction({
    feePayer: payer,
    blockhash,
    lastValidBlockHeight,
  }).add(memoInstruction);

  return tx;
}
