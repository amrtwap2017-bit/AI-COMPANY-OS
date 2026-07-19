/**
 * lib/auth.ts
 * Simple auth hook for Hub Dashboard.
 * DEV MODE: no real auth — always returns dev user.
 */
"use client";

import { useState, useCallback } from "react";

interface AuthUser {
  id:       string;
  username: string;
  email:    string;
  role:     string;
}

interface AuthState {
  user:        AuthUser | null;
  isLoaded:    boolean;
  isSignedIn:  boolean;
}

const DEV_USER: AuthUser = {
  id:       "dev-001",
  username: "amr",
  email:    "amr@triangleblack.com",
  role:     "admin",
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user:       DEV_USER,
    isLoaded:   true,
    isSignedIn: true,
  });

  const login = useCallback(async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // DEV MODE — accept any credentials
    setState({ user: DEV_USER, isLoaded: true, isSignedIn: true });
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    // DEV MODE — do nothing
  }, []);

  return {
    user:       state.user,
    isLoaded:   state.isLoaded,
    isSignedIn: state.isSignedIn,
    login,
    logout,
  };
}

export type { AuthUser };
