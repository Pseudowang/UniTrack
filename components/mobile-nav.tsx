"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type MarketingLink = {
  href: string;
  label: string;
};

interface MobileNavProps {
  marketingNav: MarketingLink[];
  isAuthenticated: boolean;
}

export function MobileNav({ marketingNav, isAuthenticated }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerBaseClasses =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050713]";
  const triggerButtonClasses = isOpen
    ? `${triggerBaseClasses} border-transparent bg-white text-[#050713] hover:bg-white/90`
    : `${triggerBaseClasses} border-white/30 bg-white/5 text-white hover:border-white/60 hover:bg-white/10`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-label="打开导航菜单"
        onClick={() => setIsOpen((prev) => !prev)}
        className={triggerButtonClasses}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeMenu}>
          <div
            className="relative ml-auto flex h-full w-full max-w-xs flex-col gap-6 border-l border-white/5 bg-gradient-to-b from-[#161d34] via-[#0c1326] to-[#050713] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Menu
              </span>
              <button
                type="button"
                aria-label="关闭导航菜单"
                onClick={closeMenu}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white/40"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="space-y-3">
              {marketingNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="block rounded-2xl border border-white/10 px-4 py-3 text-base font-medium text-white/80 transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-3 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="block rounded-xl bg-white/10 px-4 py-3 text-base font-medium text-white transition hover:bg-white/20"
                  >
                    控制台
                  </Link>
                  <Link
                    href="/items/new"
                    onClick={closeMenu}
                    className="block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground"
                  >
                    添加追踪
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-xl px-4 py-3 text-base text-white hover:bg-white/10"
                    onClick={() => {
                      closeMenu();
                      signOut({ callbackUrl: "/auth/signin" });
                    }}
                  >
                    退出登录
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    onClick={closeMenu}
                    className="block rounded-xl bg-white/5 px-4 py-3 text-base font-medium text-white/80 transition hover:text-white"
                  >
                    登录
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={closeMenu}
                    className="block rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30"
                  >
                    立即体验
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6l-12 12" />
    </svg>
  );
}
