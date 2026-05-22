import { BarChart3, Bell, TrendingDown, Zap } from "lucide-react";

const features = [
  {
    title: "实时价格追踪",
    description:
      "全天候监控您最喜欢的优衣库商品。价格数据自动更新，实时掌握最新信息。",
    icon: TrendingDown,
  },
  {
    title: "即时通知提醒",
    description: "价格下降的那一刻就收到提醒。再也不会错过任何好交易。",
    icon: Bell,
  },
  {
    title: "价格历史分析",
    description: "查看详细的价格趋势和历史记录。根据数据洞察做出明智的购物决策。",
    icon: BarChart3,
  },
  {
    title: "智能收藏清单",
    description: "构建您的个人商品清单。同时追踪多件商品，无限制添加。",
    icon: Zap,
  },
  {
    title: "价格下降提醒",
    description: "设置自定义价格阈值。当商品达到您的目标价格时获得提醒。",
    icon: TrendingDown,
  },
  {
    title: "省钱仪表板",
    description: "追踪您的总省钱额。查看通过价格提醒和优惠节省的金额。",
    icon: BarChart3,
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-y border-border bg-secondary/30 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
            为您设计的强大功能
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            追踪优衣库价格和不错过优惠所需的一切
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-background p-8 transition-colors hover:border-primary/50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
