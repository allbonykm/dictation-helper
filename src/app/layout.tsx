import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKR = Noto_Serif_KR({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
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
      <body className={notoSerifKR.className}>
        {children}
      </body>
    </html>
  );
}

