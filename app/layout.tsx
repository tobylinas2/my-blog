import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Toby's Workshop",
    template: "%s | Toby's Workshop",
  },
  description: "独立开发者 Toby Linas 的个人工坊 — Minecraft Mod、工具与想法",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
