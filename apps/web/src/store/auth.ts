import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  token: string;
  email: string;
  login: (token: string, email: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: '',
      email: '',
      login: (token, email) => set({ token, email }),
      logout: () => set({ token: '', email: '' }),
    }),
    { name: 'brewlite-auth' },
  ),
);
