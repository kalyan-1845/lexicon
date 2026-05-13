import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lexicon AI — Agentic Research Workspace",
  description: "Next-generation multi-agent research platform for high-density knowledge synthesis.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} dark antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-indigo-500/30">
        <CommandPalette />
        <div className="relative flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
