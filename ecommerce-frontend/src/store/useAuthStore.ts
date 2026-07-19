import { create } from "zustand";
import type { UserResponse } from "../types";
import { getCurrentUser, loginUser } from "../api/auth";
import { clearToken, setToken, getToken } from "../api/client";

interface AuthState {
  user: UserResponse | null;
  isLoading: boolean; // true while restoring session on app load
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserResponse>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const tokenRes = await loginUser(email, password);
    setToken(tokenRes.access_token);
    const user = await getCurrentUser();
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false });
  },

  // Call this once on app boot to check for an existing token in
  // localStorage and re-fetch the user, so refreshing the page doesn't
  // log the user out.
  restoreSession: async () => {
    const token = getToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
