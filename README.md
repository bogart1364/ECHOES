# Echoes Fans — front-end demo

Record → tokenize → publish → listen → trade, built for the [Superteam Front-End Developer
listing](https://superteam.fun/earn/listing/front-end-developer-for-echoes-fans).

## What's real vs. mocked

| Feature | Status |
|---|---|
| Microphone recording (waveform, timer) | **Real** — `MediaRecorder` + `AnalyserNode`, no keys needed |
| Wallet connect (Phantom / Solflare) | **Real** — `@solana/wallet-adapter-*` |
| Privy sign-in (email/SMS/embedded wallet) | **Real**, needs `NEXT_PUBLIC_PRIVY_APP_ID` |
| AI audio cleanup (ElevenLabs Audio Isolation) | **Real**, needs `ELEVENLABS_API_KEY` |
| Audio/cover image storage | **Real**, via Vercel Blob (see note below) |
| On-chain mint anchor | **Real** — a Memo-program transaction on Solana devnet, signed by the listener |
| Marketplace price/volume/holders | **Mocked** — a JSON file simulating a bonding curve (`lib/stories.ts`). A real deployment would call the team's actual trading/escrow program the same way this front end calls `/api/tokenize` today |
| Competitions/sponsor listings | **Mocked** static data (`app/competitions/page.tsx`) — wire to a real competitions API when one exists |

### Why Vercel Blob instead of Arweave

The original build bundled uploads onto Arweave via Irys, funded per-upload by the listener's own
wallet. Irys has since deprecated that Arweave-bundler product in favor of their own datachain,
and their old devnet bundler was correspondingly unreliable in testing (timeouts, "confirmed tx
not found" errors) — a dead end on their end, not something fixable in this codebase. Storage was
swapped to Vercel Blob, which is fast and reliable today. The story's authorship and mint
timestamp are still anchored for real on Solana via the memo transaction in `lib/solana.ts`.
Swapping in true permanent/decentralized storage later (Irys's new datachain, or another
provider) only touches `lib/storage.ts` and `app/api/upload/route.ts`.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in the keys below
npm run dev
```

## Environment variables

| Variable | Required for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Sign-in | privy.io dashboard |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Everything on-chain | defaults to public devnet; use Helius/QuickNode in production |
| `ELEVENLABS_API_KEY` | AI audio cleanup | elevenlabs.io dashboard |
| `BLOB_READ_WRITE_TOKEN` | Audio/image storage | auto-injected by Vercel once a Blob store is connected to the project (Storage tab → Create Database → Blob) — no manual key needed on Vercel; for local dev, copy the token from the Vercel dashboard into `.env.local` |

## Architecture notes

- **App Router, TypeScript, Tailwind** — same stack family as `solana-swap-agent`, kept
  consistent on purpose.
- **No custom Solana program.** Tokenization is anchored via the Memo program rather than a
  bespoke SPL mint, so the whole flow works without deploying and auditing a new on-chain
  program — appropriate scope for a front-end role. Swapping in a real mint/bonding-curve
  program later only touches `lib/solana.ts` and `lib/stories.ts`.
- **Mock trading is isolated** behind `lib/stories.ts` and one API route, so replacing it with a
  real market maker or escrow contract doesn't touch any UI component.
