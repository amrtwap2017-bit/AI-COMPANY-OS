import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Triangle Black — Hotel Engineering Platform",
  description: "Hotel CRM and Engineering Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
