"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usersApi } from "@/lib/api";
import { ROLE_CONFIG, formatDate, formatRelative } from "@/lib/utils";
import { UserPlus, Search, CheckCircle, XCircle } from "lucide-react";

interface User {
  id: string; name: string; email: string;
  role: string; is_active: boolean; created_at: string;
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${bg}`}>
      {label}
    </span>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agent" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => usersApi.list().then((r) => r.data as User[]),
    refetchInterval: 15000,
  });

  const filtered = users.filter((u) =>
    search === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields required"); return;
    }
    setCreating(true); setError("");
    try {
      await usersApi.create(form);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "agent" });
    } catch {
      setError("Failed to create user.");
    } finally { setCreating(false); }
  }

  const roleCount = (role: string) => users.filter((u) => u.role === role).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} platform users</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg
            text-sm font-medium hover:bg-[#6D28D9] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
        >
          <UserPlus className="w-4 h-4" /> New User
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-4 gap-3">
        {["admin","manager","agent","client"].map((role) => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-gray-900">{roleCount(role)}</p>
              <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} />
            </div>
          );
        })}
      </div>

      {/* Create user form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-purple-200 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Create New User</h2>
          {error && (
            <div role="alert" className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ⚠ {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="uname" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input id="uname" required value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label htmlFor="uemail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="uemail" type="email" required value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label htmlFor="upass" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="upass" type="password" required value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label htmlFor="urole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select id="urole" value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-white"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="agent">Agent</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600
                  hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium
                  hover:bg-[#6D28D9] disabled:opacity-50 focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-[#7C3AED]">
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search users..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
          className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div role="status" className="text-center py-12 text-gray-400">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm" aria-label="Users table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Name","Email","Role","Status","Created","Last Active"].map((h) => (
                  <th key={h} scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => {
                const rc = ROLE_CONFIG[user.role] || { label: user.role, color: "text-gray-600", bg: "bg-gray-100" };
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#7C3AED]/10 flex items-center
                          justify-center text-[#7C3AED] font-semibold text-sm flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge label={rc.label} color={rc.color} bg={rc.bg} />
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        : <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-gray-400">{formatRelative(user.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
