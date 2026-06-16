import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CommandPalette from "@/components/CommandPalette";
import ToastContainer from "@/components/Toast";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans-var",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="en" className={`${sans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && typeof event.reason.message === 'string' && event.reason.message.includes('MetaMask')) {
                  event.preventDefault();
                  console.warn('Suppressed MetaMask extension error:', event.reason.message);
                }
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans selection:bg-indigo-500/30">
        <CommandPalette />
        <ToastContainer />
        <div className="relative flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip bg-[var(--theme-bg)]">
          {children}
        </div>
      </body>
    </html>
  );
}
