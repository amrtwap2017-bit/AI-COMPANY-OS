"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/hooks/useAuthFetch";
import { KpiCard } from "@/components/ui/KpiCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KeyRound, RefreshCw, Users, Shield, CheckCircle2, Plus } from "lucide-react";

export default function IdentityManagementPage() {
  const queryClient = useQueryClient();
  const [idpType, setIdpType] = useState("saml");
  const [idpIssuer, setIdpIssuer] = useState("https://sts.windows.net/tenant-id/");
  const [ssoUrl, setSsoUrl] = useState("https://login.microsoftonline.com/saml2");
  const [scimEmail, setScimEmail] = useState("");
  const [scimName, setScimName] = useState("");
  const [provisionResult, setProvisionResult] = useState<any>(null);

  const { data: ssoConfig, refetch: refetchConfig } = useQuery(
    ["sso-config"],
    () => authFetch("/api/v1/sso/config").then(r => r.json()),
    { staleTime: 30000 }
  );

  const { data: scimUsers, refetch: refetchUsers } = useQuery(
    ["scim-users"],
    () => authFetch("/api/v1/scim/v2/Users?count=20").then(r => r.json()),
    { staleTime: 30000 }
  );

  const saveSsoMutation = useMutation(
    () =>
      authFetch("/api/v1/sso/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idp_type: idpType, idp_issuer: idpIssuer, sso_url: ssoUrl, is_enabled: true })
      }).then(r => r.json()),
    { onSuccess: () => refetchConfig() }
  );

  const provisionMutation = useMutation(
    () =>
      authFetch("/api/v1/scim/v2/Users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
          userName: scimEmail,
          name: { formatted: scimName },
          emails: [{ value: scimEmail, primary: true }]
        })
      }).then(r => r.json()),
    {
      onSuccess: (data) => {
        setProvisionResult(data);
        setScimEmail("");
        setScimName("");
        queryClient.invalidateQueries(["scim-users"]);
      }
    }
  );

  const users = scimUsers?.Resources || [];

  return (
    <div className="min-h-screen bg-base p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <KeyRound className="w-7 h-7 text-brand" />
            Enterprise Identity & SCIM 2.0
          </h1>
          <p className="text-sm text-secondary mt-1">
            SAML 2.0 / OIDC federation + RFC 7644 automated user provisioning
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => { refetchConfig(); refetchUsers(); }}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="SSO Status" value={ssoConfig?.is_enabled ? "Active" : "Inactive"} sub={ssoConfig?.idp_type?.toUpperCase() || "—"} color={ssoConfig?.is_enabled ? "emerald" : "amber"} status={ssoConfig?.is_enabled ? "ok" : "warning"} />
        <KpiCard label="Provisioned Users" value={users.length} sub="SCIM Directory" color="blue" />
        <KpiCard label="Protocol" value="RFC 7644" sub="SCIM 2.0 Compliant" color="purple" status="ok" />
        <KpiCard label="Zero-Trust" value="100%" sub="JWT-Bound Sessions" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SSO Config */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Shield className="w-4 h-4 text-brand" />
            Identity Provider Configuration
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); saveSsoMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                Authentication Protocol
              </label>
              <select value={idpType} onChange={(e) => setIdpType(e.target.value)}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand/30">
                <option value="saml">SAML 2.0 (Microsoft Entra / Okta)</option>
                <option value="oidc">OpenID Connect (OIDC)</option>
              </select>
            </div>
            <Input label="IdP Issuer URI" value={idpIssuer} onChange={(e) => setIdpIssuer(e.target.value)} />
            <Input label="SSO Endpoint URL" value={ssoUrl} onChange={(e) => setSsoUrl(e.target.value)} />
            <Button type="submit" loading={saveSsoMutation.isLoading} className="w-full">
              Save SSO Configuration
            </Button>
          </form>

          {ssoConfig?.idp_issuer && (
            <div className="p-3 rounded-lg border border-success-border bg-success-bg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-success-text">
                <CheckCircle2 className="w-3.5 h-3.5" /> SSO Configured
              </div>
              <p className="text-tertiary font-mono truncate">{ssoConfig.idp_issuer}</p>
            </div>
          )}
        </div>

        {/* SCIM Provisioning */}
        <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
          <h2 className="text-base font-bold text-primary flex items-center gap-2 border-b border-divider pb-3">
            <Plus className="w-4 h-4 text-brand" />
            SCIM User Provisioning
          </h2>
          <form onSubmit={(e) => { e.preventDefault(); if (scimEmail && scimName) provisionMutation.mutate(); }} className="space-y-3">
            <Input label="Display Name" placeholder="Eng. Ahmed Mansour" value={scimName} onChange={(e) => setScimName(e.target.value)} required />
            <Input label="Email (userName)" placeholder="engineer@hotel.com" value={scimEmail} onChange={(e) => setScimEmail(e.target.value)} required />
            <Button type="submit" loading={provisionMutation.isLoading} disabled={!scimEmail || !scimName} variant="secondary" className="w-full">
              <Users className="w-3.5 h-3.5 mr-1.5" /> Provision User via SCIM
            </Button>
          </form>

          {provisionResult && (
            <div className="p-3 rounded-lg border border-success-border bg-success-bg text-xs">
              <div className="font-bold text-success-text mb-1">✓ User provisioned</div>
              <p className="text-tertiary">{provisionResult.userName}</p>
            </div>
          )}

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {users.slice(0, 8).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded border border-border bg-surface-alt text-xs">
                <span className="font-semibold text-primary truncate">{u.name?.formatted || u.userName}</span>
                <StatusBadge status={u.active ? "active" : "inactive"} variant={u.active ? "success" : "warning"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
