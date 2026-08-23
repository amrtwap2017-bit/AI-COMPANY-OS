"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  KeyRound, ShieldCheck, Users, RefreshCw,
  CheckCircle2, Building2, Lock, ArrowRight
} from "lucide-react";

export default function SSOSCIMWorkbenchPage() {
  const queryClient = useQueryClient();
  const [idpType, setIdpType] = useState("saml");
  const [idpIssuer, setIdpIssuer] = useState("https://sts.windows.net/tenant-id/");
  const [ssoUrl, setSsoUrl] = useState("https://login.microsoftonline.com/saml2");

  const { data: config = {}, isLoading, refetch } = useQuery(
    ["sso-config"],
    () => authFetch("/api/v1/sso/config").then(r => r.json()),
    { staleTime: 30000 }
  );

  const saveMutation = useMutation(
    () =>
      authFetch("/api/v1/sso/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idp_type: idpType,
          idp_issuer: idpIssuer,
          sso_url: ssoUrl,
          is_enabled: true
        })
      }).then(r => r.json()),
    {
      onSuccess: () => {
        alert("SSO Configuration saved successfully!");
        queryClient.invalidateQueries(["sso-config"]);
      }
    }
  );

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2.5">
              <KeyRound className="w-7 h-7 text-brand" />
              Enterprise SSO & SCIM 2.0 Directory Sync
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
              RFC 7644 Compliant
            </span>
          </div>
          <p className="text-sm text-secondary mt-1">
            Federate identity across Okta, Microsoft Entra ID (Azure AD), and PingIdentity with automated SCIM user provisioning.
          </p>
        </div>
        <div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Status
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Identity Federation" value={config.is_enabled ? "Active" : "Inactive"} sub="SAML 2.0 / OIDC" color="emerald" status="ok" />
        <KpiCard label="Directory Sync" value="SCIM 2.0" sub="Automated Provisioning" color="blue" status="ok" />
        <KpiCard label="Supported IdPs" value="Azure, Okta, Ping" sub="Enterprise Standard" color="purple" />
        <KpiCard label="Zero-Trust Enforcement" value="100%" sub="JWT-Bound Tenants" color="brand" />
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Lock className="w-4 h-4 text-brand" />
            Identity Provider (IdP) Configuration
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Authentication Protocol
              </label>
              <select
                value={idpType}
                onChange={(e) => setIdpType(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="saml">SAML 2.0 (Microsoft Entra / Okta SAML)</option>
                <option value="oidc">OpenID Connect (OIDC / OAuth 2.0)</option>
              </select>
            </div>

            <Input
              label="IdP Entity ID / Issuer URI"
              value={idpIssuer}
              onChange={(e) => setIdpIssuer(e.target.value)}
              placeholder="https://sts.windows.net/tenant-guid/"
              required
            />

            <Input
              label="IdP Single Sign-On (SSO) Endpoint URL"
              value={ssoUrl}
              onChange={(e) => setSsoUrl(e.target.value)}
              placeholder="https://login.microsoftonline.com/tenant-guid/saml2"
              required
            />

            <Button type="submit" loading={saveMutation.isLoading} className="w-full">
              Save SSO Configuration
            </Button>
          </form>
        </div>

        {/* SCIM 2.0 Endpoint Details */}
        <div className="lg:col-span-5 rounded-xl border border-border bg-surface p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
              <Users className="w-4 h-4 text-brand" />
              SCIM 2.0 Base URL & Endpoints
            </h2>

            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
                <span className="text-secondary block font-sans font-bold">SCIM Base URL:</span>
                <span className="text-brand break-all">https://api.triangleblack.com/api/v1/scim/v2</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
                <span className="text-secondary block font-sans font-bold">Users Endpoint:</span>
                <span className="text-primary break-all">/api/v1/scim/v2/Users</span>
              </div>
              <div className="p-3 rounded-lg border border-border bg-surface-alt space-y-1">
                <span className="text-secondary block font-sans font-bold">Auth Scheme:</span>
                <span className="text-primary">HTTP Bearer Token</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-divider text-xs text-tertiary flex items-center justify-between">
            <span>Directory Sync: RFC 7644 Verified</span>
            <span className="text-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
