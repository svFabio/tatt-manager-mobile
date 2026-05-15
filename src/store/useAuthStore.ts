import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzcGFAc2Ftc2FyYS5jb20iLCJyb2wiOiJBRE1JTiIsIm5lZ29jaW9JZCI6MSwiaWF0IjoxNzc4Nzg3NzY5LCJleHAiOjIwOTQzNjM3Njl9.1haBNvqfedxRB2UGDwYHIw0sYuTVMBbw5PZ9hJXar2w";

export const useAuthStore = create<AuthState>((set) => ({
  token: DEV_TOKEN,
  setToken: (token) => set({ token }),
  clearToken: () => set({ token: null }),
}));
