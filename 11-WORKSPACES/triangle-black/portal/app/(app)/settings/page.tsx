"use client";
// @ts-nocheck
import { useState } from "react";
import { PageHeader, PageWrapper, SectionCard, AlertBanner } from "@/components/ui";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { toast } from "@/lib/toast";
import { Bell, Globe, Shield, Palette, Database, Save } from "lucide-react";

const SETTING_TABS = [
  { key: "general",       label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "security",      label: "Security" },
  { key: "system",        label: "System" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("general");
  const [appName, setAppName] = useState("Triangle Black");
  const [timezone, setTimezone] = useState("Africa/Cairo");
  const [currency, setCurrency] = useState("EGP");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  function handleSave() {
    toast.success("Settings saved successfully");
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and preferences"
        badge="SYS"
        actions={
          <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
            Save Changes
          </Button>
        } />

      <Tabs tabs={SETTING_TABS} active={tab} onChange={setTab} />

      {tab === "general" && (
        <div className="max-w-2xl space-y-4">
          <SectionCard title="Platform Identity">
            <div className="space-y-4">
              <Input label="Platform Name" value={appName}
                onChange={e => setAppName(e.target.value)}
                helper="Displayed in the browser tab and emails" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Default Timezone" value={timezone}
                  onChange={e => setTimezone(e.target.value)} />
                <Input label="Default Currency" value={currency}
                  onChange={e => setCurrency(e.target.value)} />
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Regional Settings">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date Format" value="DD/MM/YYYY" readOnly />
              <Input label="Language" value="English (EN)" readOnly />
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "notifications" && (
        <div className="max-w-2xl space-y-4">
          <SectionCard title="Notification Channels"
            subtitle="Configure how and where you receive alerts">
            <div className="space-y-4">
              {[
                { label: "Email Notifications", desc: "Receive alerts via email", value: emailNotifs, set: setEmailNotifs },
                { label: "SMS Notifications",   desc: "Receive urgent alerts via SMS", value: smsNotifs, set: setSmsNotifs },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => item.set(!item.value)}
                    className={"relative w-11 h-6 rounded-full transition-colors " + (item.value ? "bg-amber-600" : "bg-slate-200")}
                    role="switch" aria-checked={item.value}
                  >
                    <span className={"absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform " + (item.value ? "translate-x-5" : "")} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-2xl space-y-4">
          <AlertBanner type="info"
            title="Security settings are managed by your administrator"
            description="Contact support@triangleblack.com to change security policies" />
          <SectionCard title="Session Policy">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Session Timeout</p>
                  <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">8 hours</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Additional login verification</p>
                </div>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">Coming soon</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {tab === "system" && (
        <div className="max-w-2xl space-y-4">
          <SectionCard title="System Information">
            <div className="space-y-2">
              {[
                { label: "Version",     value: "v3.1.0" },
                { label: "Environment", value: process.env.NODE_ENV || "development" },
                { label: "Database",    value: "PostgreSQL (connected)" },
                { label: "AI Engine",   value: "Ollama (local)" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </PageWrapper>
  );
}
