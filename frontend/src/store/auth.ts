import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Thông tin đăng nhập: token rỗng nghĩa là chưa đăng nhập
type AuthState = {
  token: string;
  email: string;
  login: (token: string, email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  // persist: lưu vào trình duyệt, tải lại trang vẫn còn đăng nhập
  persist(
    (set) => ({
      token: '',
      email: '',

      login: (token, email) => {
        set({ token: token, email: email });
      },

      logout: () => {
        set({ token: '', email: '' });
      },
    }),
    {
      name: 'brewlite-auth',
      skipHydration: true, // Header sẽ tự nạp lại sau khi trang mở
    },
  ),
);
