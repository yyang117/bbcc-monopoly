import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BBCC Monopoly",
  description: "供应链技术比赛 — BBCC全链路大富翁游戏",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
