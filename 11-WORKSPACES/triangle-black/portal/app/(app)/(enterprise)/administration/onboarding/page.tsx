"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Building2, ShieldCheck, User, Wrench,
  CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Building
} from "lucide-react";

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [brand, setBrand] = useState("");
  const [siteName, setSiteName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/v1/onboarding/provision-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          hotel_name: hotelName,
          brand: brand || "Hospitality Luxury",
          site_name: siteName || "Main Property",
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        setStep(4); // Success step
      } else {
        alert(data.detail || "Provisioning error");
      }
    } catch (err: any) {
      alert("Failed to provision organization: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base p-6 md:p-10 flex flex-col justify-center max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand-border">
          <Sparkles className="w-3.5 h-3.5" />
          Self-Service Property Activation
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Hospitality Organization Provisioning Wizard
        </h1>
        <p className="text-sm text-secondary">
          Activate a new property with automated multi-tenant database isolation, default sites, and workflow definitions.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between border-b border-border pb-4 text-xs font-bold text-secondary">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-brand" : ""}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center">1</span>
          Company & Property
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-brand" : ""}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center">2</span>
          Site & Compounds
        </div>
        <div className={`flex items-center gap-2 ${step >= 3 ? "text-brand" : ""}`}>
          <span className="w-5 h-5 rounded-full border flex items-center justify-center">3</span>
          Admin Credentials
        </div>
      </div>

      {/* Multi-Step Body */}
      <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand" />
              Property Identity & Brand
            </h2>
            <Input
              label="Corporate Company / Holding Name"
              placeholder="e.g. Red Sea Luxury Resorts LLC"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              label="Hotel / Property Name"
              placeholder="e.g. Sharm Grand Plaza Resort"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              required
            />
            <Input
              label="Hospitality Brand"
              placeholder="e.g. Premium Beach Collection"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
            <div className="pt-4 flex justify-end">
              <Button
                disabled={!companyName.trim() || !hotelName.trim()}
                onClick={() => setStep(2)}
              >
                Continue to Site Setup <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <Building className="w-5 h-5 text-brand" />
              Primary Site & Compound Setup
            </h2>
            <Input
              label="Main Site / Compound Name"
              placeholder="e.g. Main Resort & Central Plant Compound"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />
            <div className="p-4 rounded-lg bg-surface-alt border border-border text-xs text-secondary space-y-1">
              <div className="font-bold text-primary">Automated Template Activation:</div>
              <div>• Initial work order state machine (Open → Assigned → In Progress → Closed)</div>
              <div>• Standard HVAC, Mechanical, and Plumbing asset classifications</div>
              <div>• Multi-tenant database boundary verification</div>
            </div>
            <div className="pt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button disabled={!siteName.trim()} onClick={() => setStep(3)}>
                Configure Admin User <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleProvision} className="space-y-5">
            <h2 className="text-base font-bold text-primary flex items-center gap-2">
              <User className="w-5 h-5 text-brand" />
              Administrator & Access Credentials
            </h2>
            <Input
              label="Director of Engineering / GM Full Name"
              placeholder="e.g. Eng. Ahmed Mansour"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
            <Input
              label="Admin Login Email"
              type="email"
              placeholder="e.g. ahmed.mansour@sharmresorts.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              label="Secure Master Password"
              type="password"
              placeholder="••••••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <div className="pt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              <Button type="submit" loading={loading} disabled={loading || !adminEmail.trim() || !adminPassword.trim()}>
                Provision & Activate Organization
              </Button>
            </div>
          </form>
        )}

        {step === 4 && result && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success-bg border border-success-border text-success-text flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-primary">Property Provisioning Complete!</h2>
            <div className="p-4 rounded-lg bg-surface-alt border border-border text-xs text-secondary text-left space-y-1 font-mono max-w-md mx-auto">
              <div>Tenant ID: <span className="text-primary font-bold">{result.hotel_id}</span></div>
              <div>Site ID: <span className="text-primary font-bold">{result.site_id}</span></div>
              <div>Admin: <span className="text-primary font-bold">{result.admin_email}</span></div>
              <div>Audit Ref: <span>{result.audit_reference}</span></div>
            </div>
            <div className="pt-2">
              <Button onClick={() => router.push("/login")}>
                Proceed to Login <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
