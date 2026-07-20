// @ts-nocheck
export const dynamic = "force-dynamic";
import { Toaster } from 'sonner';
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Triangle Black",
  description: "Enterprise Operations Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <Providers>{children}
        <Toaster richColors position="top-right" /></Providers>
      </body>
    </html>
  );
}
