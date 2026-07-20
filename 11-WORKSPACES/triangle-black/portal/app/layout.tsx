// @ts-nocheck
export const dynamic = "force-dynamic";
import { Toaster } from 'sonner';
import { ClientInit } from '@/components/ClientInit';
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Triangle Black",
  description: "Enterprise Operations Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0 }}>
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-600 focus:text-white focus:rounded-xl focus:font-semibold focus:text-sm focus:shadow-lg">
          Skip to main content
        </a>
        <Providers>{children}
        <ClientInit />
        <Toaster richColors position="top-right" /></Providers>
      </body>
    </html>
  );
}
