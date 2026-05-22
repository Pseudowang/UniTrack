const steps = [
  {
    title: "添加商品",
    description:
      "粘贴优衣库商品链接或商品编码。UniTrack 立即开始监控价格变化。",
  },
  {
    title: "我们为您监控",
    description: "我们的系统持续监控价格变化。每天多次检查是否有任何变动。",
  },
  {
    title: "您来省钱",
    description: "价格下降时获得即时通知。在最佳时机购买并节省金钱。",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold sm:text-5xl">工作原理</h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            三个简单步骤开始使用
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="mb-3 text-2xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
