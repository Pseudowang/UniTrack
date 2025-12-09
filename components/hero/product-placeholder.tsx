import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {/* Product Image Area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden group border border-border/50">
        
        <Image
          src="/hero-product.png"
          alt="Uniqlo T-Shirt"
          fill
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
        />

        {/* Safe/Discount Badge Overlay */}
         <div className="absolute top-3 left-3 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Watching
         </div>
      </div>

      {/* Link Placeholder */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground justify-center opacity-80">
        <span className="border-b border-primary/30 pb-0.5 text-primary">查看商品详情</span>
      </div>
    </div>
  );
}
