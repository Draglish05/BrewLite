import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import AuthLink from "@/components/AuthLink";
import CartLink from "@/components/CartLink";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrewLite",
  description: "Đặt đồ uống không dùng tiền mặt",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <Link href="/" className="text-xl font-bold">
            BrewLite
          </Link>
          <div className="flex items-center gap-4">
            <AuthLink />
            <CartLink />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
