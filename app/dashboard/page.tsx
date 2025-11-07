import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CrawlAllButton } from "@/components/crawl-all-button";
import { DeleteTrackedItemButton } from "@/components/delete-tracked-item-button";

function formatPrice(priceCent?: number | null) {
  if (priceCent === null || priceCent === undefined) {
    return "—";
  }
  return `¥ ${(priceCent / 100).toFixed(2)}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const [items, notifications] = await Promise.all([
    prisma.trackedItem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        snapshots: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          查看你的追踪商品、一键触发抓取，并了解最近的变更通知。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-col gap-2 space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>追踪商品</CardTitle>
              <CardDescription>当前登录用户的追踪列表。</CardDescription>
            </div>
            <Link
              href="/items/new"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              添加
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                暂无数据，先去添加一个商品吧。
              </p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => {
                  const latestSnapshot = item.snapshots[0];
                  return (
                    <li
                      key={item.id}
                      className="rounded-lg border p-4 shadow-sm transition hover:border-primary"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {item.title ?? `商品 ${item.productCode}`}
                          </p>
                          <p className="break-all text-xs text-muted-foreground">
                            {item.url}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground md:items-end">
                            <span>
                              现价：{formatPrice(latestSnapshot?.priceCent)}
                            </span>
                            <span>
                              列表价：{formatPrice(
                                latestSnapshot?.listPriceCent
                              )}
                            </span>
                            <span>
                              库存：
                              {latestSnapshot?.inStock === undefined
                                ? "未知"
                                : latestSnapshot?.inStock
                                ? "有货"
                                : "缺货"}
                            </span>
                          </div>
                          <DeleteTrackedItemButton
                            itemId={item.id}
                            itemLabel={item.title ?? `商品 ${item.productCode}`}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>触发抓取</CardTitle>
              <CardDescription>调用后端 /api/crawl/all 伪爬虫。</CardDescription>
            </CardHeader>
            <CardContent>
              <CrawlAllButton />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近通知</CardTitle>
              <CardDescription>展示最新的变更事件及状态。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无通知。</p>
              ) : (
                <ul className="space-y-4 text-sm">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className="rounded-md border p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-foreground">
                          {notification.changeEvent.trackedItem.title ??
                            `商品 ${notification.changeEvent.trackedItem.productCode}`}
                        </p>
                        <span className="text-xs uppercase text-muted-foreground">
                          {notification.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        类型：{notification.changeEvent.changeType}
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-2 text-xs text-muted-foreground">
                        {JSON.stringify(notification.changeEvent.diff, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
