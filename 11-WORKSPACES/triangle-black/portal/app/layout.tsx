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
        <Providers>{children}
        <ClientInit />
        <Toaster richColors position="top-right" /></Providers>
      </body>
    </html>
  );
}
