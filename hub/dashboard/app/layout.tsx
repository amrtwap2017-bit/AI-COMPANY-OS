import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "AI Company OS",
  description: "Intelligent Engineering Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui, sans-serif",
        background: "#0f172a", color: "#f1f5f9", display: "flex",
        minHeight: "100vh" }}>

        {/* Sidebar */}
        <Sidebar />

        {/* Main content — offset by sidebar width */}
        <main style={{
          marginLeft: 220, flex: 1, minHeight: "100vh",
          padding: "24px 32px",
          background: "#0f172a",
          overflowY: "auto",
        }}>
          {children}
        </main>

      </body>
    </html>
  );
}
