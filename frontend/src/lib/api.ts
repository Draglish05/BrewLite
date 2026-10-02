// Địa chỉ backend, lấy từ file frontend/.env.local
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Lấy câu báo lỗi từ phản hồi của backend
// (backend có thể trả 1 câu hoặc 1 danh sách câu)
export function getErrorMessage(data: any) {
  if (Array.isArray(data.message)) {
    return data.message.join(', ');
  }
  if (typeof data.message === 'string') {
    return data.message;
  }
  return 'Có lỗi xảy ra, vui lòng thử lại';
}
