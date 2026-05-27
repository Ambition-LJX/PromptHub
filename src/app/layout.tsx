import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { Header } from "@/components/layout/Header";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "PromptHub - AI 提示词管理系统",
  description: "管理和复用 AI 编程提示词，支持按语言、角色、阶段分类",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="theme-deep-space">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="antialiased noise-overlay">
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
            <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
              <div
                className="animate-orb-1"
                style={{
                  position: "absolute",
                  top: "-10%",
                  left: "5%",
                  width: "600px",
                  height: "400px",
                  background: "radial-gradient(ellipse, rgba(99, 102, 241, 0.12), transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                }}
              />
              <div
                className="animate-orb-2"
                style={{
                  position: "absolute",
                  top: "10%",
                  right: "5%",
                  width: "500px",
                  height: "350px",
                  background: "radial-gradient(ellipse, rgba(168, 85, 247, 0.1), transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                }}
              />
              <div
                className="animate-orb-3"
                style={{
                  position: "absolute",
                  bottom: "10%",
                  left: "30%",
                  width: "400px",
                  height: "500px",
                  background: "radial-gradient(ellipse, rgba(59, 130, 246, 0.08), transparent 70%)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                }}
              />
            </div>

            <div className="relative" style={{ zIndex: 1 }}>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </div>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
