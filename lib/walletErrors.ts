export interface FriendlyError {
  title: string;
  steps: string[];
  faucetHint: boolean;
}

/**
 * Solana wallets have no standard "switch network" RPC call the way
 * EVM wallets do (wallet_switchEthereumChain). The wallet itself decides
 * which cluster it's pointed at, so when it doesn't match our app's
 * cluster (devnet), the fix has to happen inside the wallet's own UI.
 * This turns that raw error into clear, wallet-specific steps instead
 * of surfacing the wallet's own popup text.
 */
export function describeWalletError(raw: string): FriendlyError {
  const msg = raw.toLowerCase();

  if (msg.includes("network") && (msg.includes("mismatch") || msg.includes("devnet") || msg.includes("mainnet"))) {
    return {
      title: "Your wallet is set to the wrong network",
      steps: [
        "This app runs on Solana Devnet (so publishing and trading are free to test).",
        "Solflare: click the wallet icon → gear/settings icon → Network → select Devnet.",
        "Phantom: Settings → Developer Settings → turn on Testnet Mode → choose Devnet.",
        "Then come back and try publishing again.",
      ],
      faucetHint: true,
    };
  }

  if (msg.includes("insufficient") || msg.includes("0 sol") || msg.includes("insufficient funds")) {
    return {
      title: "Your wallet needs a little devnet SOL",
      steps: [
        "Devnet SOL is free and only usable for testing — it has no real value.",
        "Get some at faucet.solana.com, paste your wallet address, and request an airdrop.",
        "Then try publishing again.",
      ],
      faucetHint: false,
    };
  }

  if (msg.includes("user rejected") || msg.includes("rejected the request")) {
    return {
      title: "Signature cancelled",
      steps: ["You closed or rejected the wallet prompt. Try publishing again when you're ready."],
      faucetHint: false,
    };
  }

  return {
    title: "Something went wrong",
    steps: [raw],
    faucetHint: false,
  };
}
