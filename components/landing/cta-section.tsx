import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold sm:text-5xl">
          准备好开始省钱了吗？
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          加入数千位聪明购物者。立即追踪您喜爱的优衣库商品，再也不错过任何优惠。
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="gap-2">
            免费开始
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
