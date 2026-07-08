export interface Story {
  id: string;
  title: string;
  authorHandle: string;
  authorWallet: string;
  arweaveUri: string; // permanent audio location
  imageUri?: string; // permanent cover art location, optional
  mintTxSignature: string; // devnet memo tx that anchors the mint
  durationSeconds: number;
  createdAt: string;
  priceUsd: number;
  change24h: number; // percentage
  holders: number;
  volume24hUsd: number;
  marketCapUsd: number;
}

export interface Competition {
  id: string;
  title: string;
  sponsor: string;
  prizeUsd: number;
  deadline: string;
  description: string;
}
