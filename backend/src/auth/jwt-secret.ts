// Lấy khóa bí mật để ký JWT từ file .env
export function getJwtSecret(): string {
  let secret = 'brewlite-dev-secret';
  if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
  }
  return secret;
}
