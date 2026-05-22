import Link from "next/link";
import { TrendingDown } from "lucide-react";

const footerColumns = [
  {
    title: "产品",
    links: [
      { label: "功能特性", href: "/#features" },
      { label: "定价", href: "#" },
      { label: "工作原理", href: "/#how-it-works" },
    ],
  },
  {
    title: "公司",
    links: [
      { label: "关于我们", href: "#" },
      { label: "博客", href: "#" },
      { label: "联系我们", href: "#" },
    ],
  },
  {
    title: "法律",
    links: [
      { label: "隐私政策", href: "#" },
      { label: "服务条款", href: "#" },
      { label: "Cookie 政策", href: "#" },
    ],
  },
  {
    title: "社交媒体",
    links: [
      { label: "Twitter", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "Discord", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 font-bold">{column.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center gap-2 md:mb-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
                <TrendingDown className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">UniTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 UniTrack。保留所有权利。为热爱优惠的优衣库购物者打造。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
