// @ts-nocheck
// Triangle Black - Auth Guard Component
// Program A - Task A4: Client-side route protection
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { tokenManager } from "@/lib/auth/token-manager";

interface AuthGuardProps {
  children:      React.ReactNode;
  requiredRole?: string | string[];
  fallback?:     React.ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router               = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") return;
    if (!isLoading && !tokenManager.isAuthenticated()) {
      router.replace("/login");
    }
  }, [isLoading, router]);

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
    return <>{children}</>;
  }

  if (isLoading) return <>{fallback || null}</>;
  if (!user)     return <>{fallback || null}</>;

  if (requiredRole) {
    const roles   = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-3xl mb-3">🔒</p>
            <p className="text-sm font-semibold text-slate-700">Access Restricted</p>
            <p className="text-xs text-slate-400 mt-1">
              Your role does not have access to this section.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
