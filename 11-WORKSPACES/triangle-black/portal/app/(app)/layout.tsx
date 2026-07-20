// @ts-nocheck
import { MobileNav } from "@/components/ui/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <MobileNav />
      <main className="lg:pl-0 pt-14 lg:pt-0 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
