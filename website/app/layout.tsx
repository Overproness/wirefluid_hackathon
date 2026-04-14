import type { Metadata } from "next";
import {
  Bebas_Neue,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CricketChain — Fan-Owned PSL Experience",
    template: "%s | CricketChain",
  },
  description:
    "Anti-scalp ticketing, fan loyalty rewards, content monetization, and DAO governance for PSL fans on WireFluid.",
  keywords: [
    "PSL",
    "cricket",
    "blockchain",
    "NFT tickets",
    "DAO",
    "WireFluid",
    "fan tokens",
  ],
  openGraph: {
    title: "CricketChain — Fan-Owned PSL Experience",
    description:
      "Anti-scalp ticketing, fan loyalty rewards, content monetization, and DAO governance for PSL fans on WireFluid.",
    type: "website",
    siteName: "CricketChain",
  },
  twitter: {
    card: "summary_large_image",
    title: "CricketChain — Fan-Owned PSL Experience",
    description:
      "Anti-scalp ticketing, fan loyalty rewards, content monetization, and DAO governance for PSL fans on WireFluid.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020617]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
