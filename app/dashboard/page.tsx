import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { PAGINATION_CONFIG } from "@/lib/constants";

import { CrawlAllButton } from "@/components/crawl-all-button";
import { ProductCard } from "@/components/product-card";
import { TrackedItemForm } from "@/components/tracked-item-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DashboardPageProps {
  searchParams?: Promise<{
    page?: string;
  }>;
}

function parsePage(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : PAGINATION_CONFIG.DEFAULT_PAGE;
}

/**
 * 展示当前用户的追踪商品列表和最近通知。
 */
export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const displayName = session.user.email ?? "Unitrack 用户";
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = parsePage(resolvedSearchParams.page);
  const pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;

  const [trackedItems, totalTrackedItems, notifications] = await Promise.all([
    prisma.trackedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        snapshots: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.trackedItem.count({
      where: { userId: session.user.id },
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
  const hasPreviousPage = page > 1;
  const hasNextPage = page * pageSize < totalTrackedItems;

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
            <TrackedItemForm variant="inline" />
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
                追踪清单（{totalTrackedItems}）
              </h2>
              <p className="text-sm text-muted-foreground">
                当前展示第 {page} 页，每页 {pageSize} 条，实时展示最近一次抓取的价格、库存与状态。
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
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trackedItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" disabled={!hasPreviousPage} asChild={hasPreviousPage}>
                  {hasPreviousPage ? (
                    <Link href={`/dashboard?page=${page - 1}`}>上一页</Link>
                  ) : (
                    <span>上一页</span>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {page} 页
                </span>
                <Button variant="outline" disabled={!hasNextPage} asChild={hasNextPage}>
                  {hasNextPage ? (
                    <Link href={`/dashboard?page=${page + 1}`}>下一页</Link>
                  ) : (
                    <span>下一页</span>
                  )}
                </Button>
              </div>
            </>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">最近通知</h2>
            <p className="text-sm text-muted-foreground">
              展示最近 10 条价格变化或库存变化通知。
            </p>
          </div>
          {notifications.length === 0 ? (
            <Alert className="card-on-white">
              <AlertDescription>暂无通知记录。</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="card-on-white gap-3">
                  <CardContent className="flex flex-col gap-1 pt-6">
                    <p className="text-sm font-medium">
                      {notification.changeEvent.trackedItem.title ??
                        `商品 ${notification.changeEvent.trackedItem.productCode}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      通道：{notification.channel}，状态：{notification.status}
                    </p>
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
