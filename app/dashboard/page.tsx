
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

import { AddItemForm } from "@/components/add-item-form";
import { CrawlAllButton } from "@/components/crawl-all-button";
import { ProductCard } from "@/components/product-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";




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
                
return <ProductCard key={item.id} item={item} />;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
