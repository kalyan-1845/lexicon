import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Lexicon AI | Expert Research Workspace",
  description: "High-density multi-agent research platform for modern knowledge synthesis.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
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
