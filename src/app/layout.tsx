import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "율이를 위한 받아쓰기 도우미 ❤️",
  description: "아빠가 사랑을 담아 만든 율이의 받아쓰기 연습 앱",
  manifest: "/manifest.json",
  themeColor: "#FFB7B2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "율이 받아쓰기",
  },
  icons: {
    apple: "/heart.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

