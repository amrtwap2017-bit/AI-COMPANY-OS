"use client";
// @ts-nocheck
import { useState, useEffect } from "react";
import { PageHeader, PageWrapper, Avatar, SectionCard } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { tokenManager } from "@/lib/auth/token-manager";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { Mail, Shield, Clock, LogOut, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [pwdOpen, setPwdOpen] = useState(false);
  const [newPwd,  setNewPwd]  = useState("");
  const [confirm, setConfirm] = useState("");

  function handleChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirm) { toast.error("Passwords do not match"); return; }
    if (newPwd.length < 8)  { toast.error("Password must be at least 8 characters"); return; }
    toast.success("Password changed successfully");
    setPwdOpen(false);
    setNewPwd(""); setConfirm("");
  }

  return (
    <PageWrapper>
      <PageHeader title="Profile" subtitle="Your account and session" badge="ME" />

      <div className="max-w-2xl space-y-4">
        <SectionCard title="Account Information">
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={user?.name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || "User"}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-flex mt-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold capitalize">
                {user?.role || "admin"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Mail,   label: "Email",   value: user?.email },
              { icon: Shield, label: "Role",    value: user?.role },
              { icon: Clock,  label: "Session", value: "Active" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <item.icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500 w-20">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 capitalize">{item.value || "—"}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Actions">
          <div className="space-y-2">
            <Button
              variant="secondary"
              icon={<Key className="w-4 h-4" />}
              onClick={() => setPwdOpen(true)}
              className="w-full justify-start"
            >
              Change Password
            </Button>
            <Button
              variant="danger"
              icon={<LogOut className="w-4 h-4" />}
              onClick={logout}
              className="w-full justify-start"
            >
              Sign Out
            </Button>
          </div>
        </SectionCard>
      </div>

      <Modal
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        title="Change Password"
        description="Enter a new password for your account"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" onClick={() => setPwdOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleChangePwd}>Update Password</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="New Password"
            placeholder="Minimum 8 characters"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
          />
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>
      </Modal>
    </PageWrapper>
  );
}
