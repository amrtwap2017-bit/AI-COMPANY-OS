// @ts-nocheck
// Triangle Black - Page Wrapper
// TB-001: Added "use client" - required because Breadcrumb uses usePathname
"use client";
import { Breadcrumb } from "./Breadcrumb";

interface PageWrapperProps {
  children:        React.ReactNode;
  showBreadcrumb?: boolean;
  className?:      string;
  noPadding?:      boolean;
}

export function PageWrapper({
  children,
  showBreadcrumb = true,
  className      = "",
  noPadding      = false,
}: PageWrapperProps) {
  return (
    <div className={"w-full max-w-screen-2xl mx-auto " + (noPadding ? "" : "px-4 sm:px-6 py-5 pb-20 ") + className}>
      {showBreadcrumb && <Breadcrumb className="mb-4" />}
      <div className="space-y-5">
        {children}
      </div>
    </div>
  );
}
