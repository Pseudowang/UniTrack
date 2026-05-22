import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div className="group relative flex flex-1 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-white dark:bg-gray-800">
        <Image
          src="/hero-product.png"
          alt="Uniqlo T-Shirt"
          fill
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          追踪中
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground opacity-80">
        <span className="border-b border-primary/30 pb-0.5 text-primary">
          查看商品详情
        </span>
      </div>
    </div>
  );
}
