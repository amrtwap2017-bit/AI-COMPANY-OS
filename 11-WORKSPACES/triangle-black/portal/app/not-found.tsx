// @ts-nocheck
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-amber-600" />
        </div>
        <div className="text-7xl font-black text-slate-200 mb-4 leading-none">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link
            href="/workspace"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3">Quick links</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Operations",   href: "/operations" },
              { label: "Supply Chain", href: "/supply-chain" },
              { label: "Analytics",    href: "/analytics" },
              { label: "Executive",    href: "/executive" },
            ].map((l: any) => (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
