import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
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
  title: "Unitrack | 智能 UNIQLO 价格监控平台",
  description:
    "为电商运营和收藏控提供的全栈监控工具，实时捕捉 uniqlo.cn 商品价格、库存与变更动态。",
};

const marketingNav = [
  { href: "/#features", label: "产品亮点" },
  { href: "/#workflow", label: "工作流" },
  { href: "/#trust", label: "信任与安全" },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[540px] bg-gradient-to-b from-indigo-600/35 via-purple-700/10 to-transparent blur-3xl" />
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,13,29,0.85)] backdrop-blur-md">
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-base font-semibold tracking-tight"
                >
                  <span className="text-white">Unitrack</span>
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-xs uppercase text-white/70">
                    Beta
                  </span>
                </Link>
                <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                  {marketingNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-3 text-sm">
                  {session?.user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="text-muted-foreground transition hover:text-white"
                      >
                        控制台
                      </Link>
                      <Link
                        href="/items/new"
                        className="rounded-full bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20"
                      >
                        添加追踪
                      </Link>
                      <SignOutButton />
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        className="text-muted-foreground transition hover:text-white"
                      >
                        登录
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                      >
                        立即体验
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
              {children}
            </main>
            <footer className="border-t border-white/10 bg-[rgba(6,8,20,0.9)]">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} Unitrack. 让商品变更更透明。</p>
                <div className="flex gap-6">
                  <Link href="/#features" className="hover:text-white">
                    产品
                  </Link>
                  <Link href="/auth/signup" className="hover:text-white">
                    注册
                  </Link>
                  <Link href="/auth/signin" className="hover:text-white">
                    登录
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
