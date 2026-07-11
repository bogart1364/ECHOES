import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import AmbientBackground from "@/components/AmbientBackground";
import MiniPlayer from "@/components/MiniPlayer";
import { AudioPlayerProvider } from "@/lib/AudioPlayerContext";
import { ToastProvider } from "@/lib/ToastContext";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["300", "500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["400", "500", "600"] });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://echoes-drab.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Echoes — own your voice",
    template: "%s — Echoes",
  },
  description:
    "Echoes is the ownership layer for audio stories on Solana. Record your story, tokenize it, and earn from every trade — permanently.",
  keywords: [
    "audio stories",
    "Solana",
    "Web3 audio",
    "voice NFT",
    "tokenized audio",
    "podcast tokenization",
    "on-chain storytelling",
  ],
  openGraph: {
    title: "Echoes — own your voice",
    description:
      "Record a story, mint it on-chain, and earn every time it trades — reliably stored, always yours.",
    siteName: "Echoes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Echoes — own your voice",
    description:
      "Record a story, mint it on-chain, and earn every time it trades — reliably stored, always yours.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body className="font-body">
        <Providers>
          <ToastProvider>
            <AudioPlayerProvider>
              <AmbientBackground />
              <Nav />
              <div className="pb-28">{children}</div>
              <MiniPlayer />
            </AudioPlayerProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
