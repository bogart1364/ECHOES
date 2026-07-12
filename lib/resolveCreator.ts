import { Story } from "@/types/story";

export interface ResolvedWallet {
  wallet: string;
  handle: string;
  storyId: string | null;
}

export function resolveWallet(wallet: string, stories: Story[]): ResolvedWallet {
  const story = stories.find((s) => s.authorWallet === wallet);
  return {
    wallet,
    handle: story?.authorHandle || `${wallet.slice(0, 4)}...${wallet.slice(-4)}`,
    storyId: story?.id || null,
  };
}
