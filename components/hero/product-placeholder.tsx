import { Shirt, ShoppingBag, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      {/* Abstract Product Image Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden group">
        
        {/* Decorative Circles */}
        <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-secondary/20 rounded-full blur-xl" />

        {/* Main Icon */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border/50">
             <Shirt className="w-16 h-16 text-primary/80 stroke-[1.5]" />
          </div>
          
          {/* Abstract details lines */}
          <div className="space-y-2 w-24">
             <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full w-full opacity-60" />
             <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full w-2/3 opacity-40 mx-auto" />
          </div>
        </div>
      </div>

      {/* Link Placeholder */}
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground justify-center opacity-80">
        <span className="border-b border-primary/30 pb-0.5 text-primary">查看商品详情</span>
      </div>
    </div>
  );
}
