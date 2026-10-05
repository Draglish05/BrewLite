import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';
import AuthGate from '@/components/AuthGate';

// Chữ thường: Be Vietnam Pro (hiển thị tiếng Việt đẹp)
const bodyFont = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
});

// Chữ logo và tiêu đề: Lora (kiểu có chân)
const logoFont = Lora({
  variable: '--font-logo',
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600'],
});

export const metadata: Metadata = {
  title: 'BrewLite',
  description: 'Đặt cà phê không dùng tiền mặt',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // Gắn 2 font vào trang
  const htmlClass = bodyFont.variable + ' ' + logoFont.variable + ' h-full antialiased';

  return (
    <html lang="vi" className={htmlClass}>
      <body className="flex min-h-full flex-col bg-cream font-sans text-espresso">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
