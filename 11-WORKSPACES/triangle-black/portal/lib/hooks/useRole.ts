// useRole — reads user role from localStorage, fetches fresh from /api/v1/me
"use client";
import { useState, useEffect } from "react";

export interface UserRole {
  role:             string;
  email:            string;
  is_admin:         boolean;
  can_write:        boolean;
  can_read_finance: boolean;
  permissions:      { resource: string; action: string }[];
}

const DEFAULT_ROLE: UserRole = {
  role:             "viewer",
  email:            "",
  is_admin:         false,
  can_write:        false,
  can_read_finance: false,
  permissions:      [],
};

export function useRole(): UserRole {
  const [roleData, setRoleData] = useState<UserRole>(DEFAULT_ROLE);

  useEffect(() => {
    // Read from localStorage first (set during login)
    const storedRole  = localStorage.getItem("tb_user_role")  || "viewer";
    const storedEmail = localStorage.getItem("tb_user_email") || "";
    const isAdmin     = localStorage.getItem("tb_is_admin")   === "true";

    setRoleData({
      role:             storedRole,
      email:            storedEmail,
      is_admin:         isAdmin,
      can_write:        ["admin","manager","engineer","finance"].includes(storedRole),
      can_read_finance: ["admin","manager","finance"].includes(storedRole),
      permissions:      [],
    });

    // Fetch fresh from API in background
    const token = localStorage.getItem("tb_token") || localStorage.getItem("tb_access_token") || "";
    if (token) {
      fetch("/api/v1/me", {
        headers: { "Authorization": "Bearer " + token }
      })
        .then(r => r.json())
        .then(d => {
          if (d.role) {
            localStorage.setItem("tb_user_role", d.role);
            localStorage.setItem("tb_is_admin", String(d.is_admin || false));
            setRoleData({
              role:             d.role,
              email:            d.email || storedEmail,
              is_admin:         Boolean(d.is_admin),
              can_write:        Boolean(d.can_write),
              can_read_finance: Boolean(d.can_read_finance),
              permissions:      d.permissions || [],
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  return roleData;
}

export default useRole;
