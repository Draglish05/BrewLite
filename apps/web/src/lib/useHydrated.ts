import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// false khi server vẽ trang, true khi đã chạy trên trình duyệt.
// Giỏ hàng lưu trong trình duyệt nên chỉ hiển thị sau khi hàm này trả về true.
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
