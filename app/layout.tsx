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

export const metadata: Metadata = {
  title: "Echoes — own your voice",
  description: "Record, tokenize, and trade audio stories on Solana.",
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
