import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";

const marketingLinks = [
  { id: "features", href: "/#features", label: "功能特性" },
  { id: "how-it-works", href: "/#how-it-works", label: "工作原理" },
  { id: "benefits", href: "/#benefits", label: "产品优势" },
] as const;

export async function SiteNav() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <TrendingDown className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">UniTrack</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">控制台</Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>开始使用</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
