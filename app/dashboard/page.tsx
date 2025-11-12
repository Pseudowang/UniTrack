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
                    className="card-on-white flex h-full flex-col overflow-hidden border-border/60"
                  >
                    <CardHeader className="flex flex-col gap-0 p-0">
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.title ?? item.productCode}
                            fill
                            sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
                            unoptimized
                            className="object-contain p-6"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border/60 p-6 text-xs text-muted-foreground">
                            暂无图片
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 border-t border-border/60 px-6 py-4">
                        <CardTitle className="text-base font-semibold leading-snug">
                          {item.title ?? `商品 ${item.productCode}`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          #{item.productCode}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.url}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 px-6 pb-6 pt-2 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          当前价格
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-semibold text-foreground">
                            {formatPrice(snapshot?.priceCent)}
                          </span>
                          {showListPrice ? (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(snapshot?.listPriceCent)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full border px-3 py-1 ${
                            snapshot?.inStock === undefined
                              ? "border-border/60 text-muted-foreground"
                              : snapshot.inStock
                              ? "border-green-500/40 text-green-600"
                              : "border-destructive/40 text-destructive"
                          }`}
                        >
                          {snapshot?.inStock === undefined
                            ? "库存未知"
                            : snapshot.inStock
                            ? "有货"
                            : "缺货"}
                        </span>
                        <span className="rounded-full border border-border/60 px-3 py-1 text-muted-foreground">
                          最近抓取 {formatDate(snapshot?.fetchedAt)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                          <p className="text-muted-foreground">追踪创建</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                          <p className="text-muted-foreground">最近同步</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(snapshot?.fetchedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto flex items-center justify-between border-t border-border/40 px-6 py-4">
                      <p className="text-xs text-muted-foreground">
                        如需移除可使用右侧操作
                      </p>
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

        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">最新通知</h2>
              <p className="text-sm text-muted-foreground">
                记录价格波动、库存变化以及任何抓取 diff。
              </p>
            </div>
          </div>
          {notifications.length === 0 ? (
            <Alert className="card-on-white">
              <AlertDescription>
                暂无通知。完成首次抓取后会在此展示。
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="card-on-white border-border/60"
                >
                  <CardHeader>
                    <CardTitle className="text-base">
                      {notification.changeEvent.trackedItem.title ??
                        `商品 ${notification.changeEvent.trackedItem.productCode}`}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {notification.status} ·{" "}
                      {notification.changeEvent.changeType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-muted-foreground">
                      生成时间：{" "}
                      {formatDate(notification.changeEvent.createdAt)}
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-md bg-muted/40 p-3 text-xs">
                      {JSON.stringify(notification.changeEvent.diff, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
