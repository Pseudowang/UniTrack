const benefits = [
  {
    title: "节省时间",
    description: "无需手动查看优衣库网站。让 UniTrack 为您自动完成。",
  },
  {
    title: "节省金钱",
    description: "即时捕捉价格下降。平均用户每月可节省 500-2000 元。",
  },
  {
    title: "智能通知",
    description: "可自定义的提醒。仅接收您关心的优惠信息。",
  },
  {
    title: "完全免费",
    description: "追踪无限数量的商品，完全免费。无隐藏费用或高级会员。",
  },
] as const;

const stats = [
  { label: "活跃用户", value: "50K+" },
  { label: "追踪商品", value: "1M+" },
  { label: "总省钱额", value: "¥1亿+" },
  { label: "正常运行率", value: "99.9%" },
] as const;

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="bg-primary px-4 py-20 text-primary-foreground sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold sm:text-5xl">
            为什么选择 UniTrack？
          </h2>
          <p className="mx-auto max-w-2xl text-xl opacity-90">
            加入成千上万位已经在省钱的聪明购物者
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/20">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold">{benefit.title}</h3>
                <p className="opacity-90">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 border-t border-primary-foreground/20 pt-12 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-2 text-4xl font-bold">{stat.value}</div>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
