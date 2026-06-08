import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CryptoTerminal - Professional Trading Platform",
  description: "A professional crypto trading analysis platform with real-time market data, paper trading, signals, and advanced charting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
