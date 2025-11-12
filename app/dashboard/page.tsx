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

  const displayName =
    session.user.name ?? session.user.email ?? "Unitrack 用户";

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
            <div className="grid gap-4 md:grid-cols-2">
              {trackedItems.map((item) => {
                const snapshot = item.snapshots[0];
                const imageUrl =
                  item.imageUrl ?? buildProductImageUrl(item.productCode);
                return (
                  <Card key={item.id} className="card-on-white border-border/60">
                    <CardHeader className="gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={item.title ?? item.productCode}
                              width={64}
                              height={64}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              暂无图片
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold leading-tight">
                            {item.title ?? `商品 ${item.productCode}`}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            #{item.productCode}
                          </p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {item.url}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-center text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">现价</p>
                          <p className="font-semibold text-foreground">
                            {formatPrice(snapshot?.priceCent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            列表价
                          </p>
                          <p className="font-semibold text-foreground">
                            {formatPrice(snapshot?.listPriceCent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">库存</p>
                          <p className="font-semibold">
                            {snapshot?.inStock === undefined
                              ? "未知"
                              : snapshot.inStock
                              ? "有货"
                              : "缺货"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            最近抓取
                          </p>
                          <p className="font-semibold">
                            {formatDate(snapshot?.fetchedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4">
                      <p className="text-xs text-muted-foreground">
                        创建于 {formatDate(item.createdAt)}
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
