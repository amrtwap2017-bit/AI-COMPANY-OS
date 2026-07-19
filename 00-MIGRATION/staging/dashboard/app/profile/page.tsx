"use client";

import { useEffect, useState } from "react";
import { api, type APIKey } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  User, Key, Trash2, Plus, Copy, Check,
  Shield, Activity,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout }         = useAuth();
  const [keys, setKeys]          = useState<APIKey[]>([]);
  const [newKeyName, setNewName] = useState("");
  const [newKeyPerms, setPerms]  = useState("read,write");
  const [createdKey, setCreated] = useState<string | null>(null);
  const [copied, setCopied]      = useState(false);
  const [loading, setLoading]    = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const r = await api.get("/auth/api-keys");
      setKeys(r.data);
    } catch {}
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const r = await api.post("/auth/api-keys", {
        name:        newKeyName,
        permissions: newKeyPerms,
      });
      setCreated(r.data.key);
      setNewName("");
      await loadKeys();
    } catch {}
    setLoading(false);
  };

  const revokeKey = async (id: number) => {
    try {
      await api.delete(`/auth/api-keys/${id}`);
      await loadKeys();
    } catch {}
  };

  const copyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Please sign in to view your profile.</p>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" /> Profile
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account and API keys
        </p>
      </div>

      {/* User info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" /> Account Details
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Username",  value: user.username },
            { label: "Email",     value: user.email },
            { label: "Full Name", value: user.full_name || "—" },
            { label: "Role",      value: user.role },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-0.5">{label}</p>
              <p className="text-sm text-gray-200 font-medium">{value}</p>
            </div>
          ))}
        </div>

        {user.is_admin && (
          <div className="flex items-center gap-2 text-yellow-400 text-xs
                          bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
            <Shield className="w-3.5 h-3.5" />
            Administrator account
          </div>
        )}

        <button onClick={logout}
          className="text-sm text-red-400 hover:text-red-300 transition-colors">
          Sign out
        </button>
      </div>

      {/* New key revealed */}
      {createdKey && (
        <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold mb-2">
            ✅ API key created — copy it now. It won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-900 text-green-300 text-xs px-3 py-2
                             rounded-lg font-mono break-all">
              {createdKey}
            </code>
            <button onClick={copyKey}
              className="flex-shrink-0 p-2 bg-gray-800 hover:bg-gray-700
                         rounded-lg transition-colors">
              {copied
                ? <Check className="w-4 h-4 text-green-400" />
                : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <button onClick={() => setCreated(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-400">
            Dismiss
          </button>
        </div>
      )}

      {/* API Keys */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" /> API Keys ({keys.length})
        </h2>

        {/* Create key */}
        <div className="flex gap-2">
          <input
            value={newKeyName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && createKey()}
            placeholder="Key name (e.g. my-app)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                       text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          />
          <select value={newKeyPerms} onChange={e => setPerms(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2
                       text-sm text-gray-200 focus:outline-none focus:border-blue-500">
            <option value="read">Read only</option>
            <option value="read,write">Read + Write</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={createKey} disabled={loading || !newKeyName.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700
                       disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {/* Keys list */}
        {keys.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-4">
            No API keys yet
          </p>
        ) : (
          <div className="space-y-2">
            {keys.map(k => (
              <div key={k.id}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg group">
                <Key className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 font-medium">{k.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-xs text-gray-500 font-mono">
                      {k.key_prefix}•••••••••••••
                    </code>
                    <span className="text-xs text-gray-600">
                      {k.permissions}
                    </span>
                    <span className={`text-xs ${k.is_active
                      ? "text-green-400" : "text-red-400"}`}>
                      {k.is_active ? "active" : "revoked"}
                    </span>
                  </div>
                </div>
                {k.is_active && (
                  <button onClick={() => revokeKey(k.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-600
                               hover:text-red-400 transition-all p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
