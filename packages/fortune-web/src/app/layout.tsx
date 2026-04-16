import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevFortune - 程序员每日运势',
  description: '基于天干地支和五行理论的程序员每日运势工具',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
