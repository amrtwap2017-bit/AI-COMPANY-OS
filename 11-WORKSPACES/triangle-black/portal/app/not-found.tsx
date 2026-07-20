// @ts-nocheck
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center p-8">
        <div className="text-8xl font-black text-slate-700 mb-4">404</div>
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-slate-400 mb-6">This page does not exist in Triangle Black</p>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
