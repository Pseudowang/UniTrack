import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceTrendHero } from "@/components/landing/price-trend-hero";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mb-12 space-y-6 text-center">
        <div className="inline-block rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          ✨ 更聪明地追踪价格，更快地节省金钱
        </div>
        <h1 className="text-5xl font-bold leading-tight text-balance sm:text-6xl lg:text-7xl">
          再也不会错过
          <br />
          <span className="text-primary">优衣库的促销</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-balance text-muted-foreground">
          实时监控您喜爱的优衣库商品。价格下降时获得即时提醒。轻松节省优质服饰的购物成本。
        </p>
        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <Link href="/auth/signup">
            <Button size="lg" className="cursor-pointer gap-2">
              立即开始追踪
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline">
              查看工作原理
            </Button>
          </Link>
        </div>
      </div>

      <PriceTrendHero />
    </section>
  );
}
