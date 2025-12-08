import Image from "next/image";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { buildProductImageUrl } from "@/lib/product-code";
import { AddItemForm } from "@/components/add-item-form";
import { CrawlAllButton } from "@/components/crawl-all-button";
import { DeleteTrackedItemButton } from "@/components/delete-tracked-item-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

function formatPrice(priceCent?: number | null) {
  if (priceCent === null || priceCent === undefined) {
    return "—";
  }
  return `¥ ${(priceCent / 100).toFixed(2)}`;
}

function formatDate(input?: Date | null) {
  if (!input) {
    return "尚未抓取";
  }
  return input.toLocaleString("zh-CN", { hour12: false });
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const displayName = session.user.email ?? "Unitrack 用户";

  const [trackedItems, notifications] = await Promise.all([
    prisma.trackedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { changeEvent: { createdAt: "desc" } },
      take: 10,
      include: {
        changeEvent: {
          include: {
            trackedItem: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8 lg:py-12">
        <section className="space-y-2 text-center md:text-left">
          <p className="inline-flex items-center rounded-full border border-border px-4 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            UniTrack Dashboard
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            欢迎回来，{displayName}
          </h1>
          <p className="text-muted-foreground">
            管理所有追踪商品、手动触发抓取，并快速了解最近的变化。
          </p>
        </section>

        <Card className="card-on-white">
          <CardHeader className="gap-3">
            <div>
              <CardTitle>添加新的追踪目标</CardTitle>
              <CardDescription>
                粘贴 UNIQLO 链接或 productCode / API ID，我们会自动补全数据。
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <AddItemForm />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-border/40 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>系统每隔数小时自动抓取。需要立即更新可手动触发。</p>
            <CrawlAllButton />
          </CardFooter>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                追踪清单（{trackedItems.length}）
              </h2>
              <p className="text-sm text-muted-foreground">
                实时展示最近一次抓取的价格、库存与状态。
              </p>
            </div>
          </div>
          {trackedItems.length === 0 ? (
            <Alert className="card-on-white">
              <AlertDescription>
                还没有追踪任何商品。添加第一条 UNIQLO 链接开始体验吧。
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trackedItems.map((item) => {
                const snapshot = item.snapshots[0];
                const imageUrl =
                  item.imageUrl ?? buildProductImageUrl(item.productCode);
                const showListPrice =
                  snapshot?.listPriceCent != null &&
                  snapshot.listPriceCent !== snapshot?.priceCent;
                
                return (
                  <Card
                    key={item.id}
                    className="card-on-white group flex mt-4 h-[740px] flex-col overflow-hidden border-border/60 transition-all hover:shadow-md"
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
                             className={`backdrop-blur-md ${
                               snapshot?.inStock === undefined 
                                 ? "bg-muted/80 text-muted-foreground" 
                                 : snapshot.inStock 
                                   ? "bg-green-100/90 text-green-700 dark:bg-green-900/90 dark:text-green-300" 
                                   : "bg-red-100/90 text-red-700 dark:bg-red-900/90 dark:text-red-300"
                             }`}
                           >
                              {snapshot?.inStock === undefined ? "状态未知" : snapshot.inStock ? "现货" : "缺货"}
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
                           <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                              {item.productCode}
                           </Badge>
                           <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground" asChild>
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
                            <div className={`h-1.5 w-1.5 rounded-full ${snapshot?.inStock === true ? 'bg-green-500' : snapshot?.inStock === false ? 'bg-red-500' : 'bg-gray-400'}`} />
                            <span>{formatDate(snapshot?.fetchedAt)} 更新</span>
                         </div>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto flex items-center justify-between border-t border-border/40 bg-muted/5 px-5 py-3">
                      <span className="text-[10px] text-muted-foreground/60">
                         添加于 {formatDate(item.createdAt).split(' ')[0]}
                      </span>
                      <DeleteTrackedItemButton
                        itemId={item.id}
                        itemLabel={item.title ?? `商品 ${item.productCode}`}
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
