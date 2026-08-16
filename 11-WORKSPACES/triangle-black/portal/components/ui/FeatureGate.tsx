// Triangle Black — Feature Gate Component (Sprint-202)
// Wraps children and only renders them if the feature flag is enabled.
// Falls back to a disabled message or nothing.
"use client";
import { useFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import React from "react";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureFlags();

  if (isLoading) return null;

  if (!isEnabled(feature)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="tb-empty">
          <div className="tb-empty-icon">🔒</div>
          <div className="tb-empty-title">Feature Not Available</div>
          <div className="tb-empty-desc">
            The <strong>{feature.replace(/_/g, " ")}</strong> feature is not enabled for your organization.
            Contact your administrator to enable it.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
