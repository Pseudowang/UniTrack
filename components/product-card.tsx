import Image from "next/image";
import { ExternalLink } from "lucide-react";

import { buildProductImageUrl } from "@/lib/product-code";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { DeleteTrackedItemButton } from "@/components/delete-tracked-item-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TargetPricePopover } from "@/components/target-price-popover";
import {
  parseTrackedItemFilters,
  type TrackedItemWithLatestSnapshot,
} from "@/types";

interface ProductCardProps {
  item: TrackedItemWithLatestSnapshot;
  className?: string;
}

export function ProductCard({ item, className }: ProductCardProps) {
  const snapshot = item.snapshots[0];
  const imageUrl = item.imageUrl ?? buildProductImageUrl(item.productCode);
  const filters = parseTrackedItemFilters(item.filters);
  const showListPrice =
    snapshot?.listPriceCent != null &&
    snapshot.listPriceCent !== snapshot?.priceCent;

  return (
    <Card
      className={cn(
        "card-on-white group flex h-[740px] flex-col overflow-hidden border-border/60 transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title ?? item.productCode}
              fill
              sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
              unoptimized
              className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/5 p-6 text-xs text-muted-foreground">
              暂无图片
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge
              variant="secondary"
              className={cn(
                "backdrop-blur-md",
                snapshot?.inStock === undefined
                  ? "bg-muted/80 text-muted-foreground"
                  : snapshot.inStock
                  ? "bg-green-100/90 text-green-700 dark:bg-green-900/90 dark:text-green-300"
                  : "bg-red-100/90 text-red-700 dark:bg-red-900/90 dark:text-red-300"
              )}
            >
              {snapshot?.inStock === undefined
                ? "状态未知"
                : snapshot.inStock
                ? "现货"
                : "缺货"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-border/60 px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-lg font-bold leading-tight tracking-tight">
              {item.title ?? `商品 ${item.productCode}`}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-normal text-muted-foreground"
            >
              {item.productCode}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              asChild
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                <span className="sr-only">访问商品页面</span>
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 pb-5 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(snapshot?.priceCent)}
          </span>
          {showListPrice && (
            <span className="text-sm text-muted-foreground line-through decoration-border">
              {formatPrice(snapshot?.listPriceCent)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                snapshot?.inStock === true
                  ? "bg-green-500"
                  : snapshot?.inStock === false
                  ? "bg-red-500"
                  : "bg-gray-400"
              )}
            />
            <span>{formatDate(snapshot?.fetchedAt)} 更新</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-t border-border/40 bg-muted/5 px-5 py-3">
        <span className="text-[10px] text-muted-foreground/60">
          添加于 {formatDate(item.createdAt).split(" ")[0]}
        </span>
        <div className="flex items-center gap-1">
          <TargetPricePopover
            itemId={item.id}
            initialTargetPrice={filters.targetPrice}
          />
          <DeleteTrackedItemButton
            itemId={item.id}
            itemLabel={item.title ?? `商品 ${item.productCode}`}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
