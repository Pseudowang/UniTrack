import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "实时监控商品", value: "3,500+" },
  { label: "平均抓取频率", value: "15 min" },
  { label: "通知触达率", value: "99.2%" },
];

const features = [
  {
    title: "多入口采集",
    description: "支持商品链接、productCode 以及官方 API ID，统一解析校验。",
    detail: "自动去重、识别 SKU，保障录入准确率。",
  },
  {
    title: "价格差异告警",
    description: "智能对比当前价与历史价，识别活动、补货与调价。",
    detail: "支持多币种展示，构建面向运营的价格决策面板。",
  },
  {
    title: "快照留存",
    description: "每次抓取都会沉淀结构化快照与差异 JSON。",
    detail: "帮助你追踪长周期商品表现，满足合规稽核。",
  },
  {
    title: "多渠道通知",
    description: "Web In-App 通知默认开启，未来将支持企业微信/钉钉。",
    detail: "自定义阈值与静默时间，降低噪音。",
  },
];

const workflow = [
  {
    title: "接入商品",
    description: "复制 uniqlo.cn 任意链接、productCode 或官方接口 ID，系统会完成解析与去重。",
  },
  {
    title: "云端巡检",
    description: "Unitrack 在云端周期性抓取 SKU 详情、库存、折扣，并与最近一次快照自动 diff。",
  },
  {
    title: "触发告警",
    description: "当价格、库存或标题发生变化时，生成 Change Event 并推送通知，附带结构化 diff。",
  },
  {
    title: "沉淀数据",
    description: "所有快照、事件与通知都会留存在你的控制台，可随时导出或二次开发。",
  },
];

const trustPoints = [
  {
    title: "账号与数据安全",
    description:
      "支持强密码策略，敏感字段通过 bcrypt+Prisma 保护；SQLite 本地开发，生产可一键切换至 PostgreSQL。",
  },
  {
    title: "透明的通知链路",
    description:
      "每条通知都关联快照与变更事件，方便团队复盘来源，避免“黑箱”决策。",
  },
  {
    title: "开发者友好",
    description:
      "基于 Next.js App Router、Tailwind CSS、Prisma 构建，二次定制无需重新造轮子。",
  },
];

export default function Home() {
  return (
    <div className="space-y-20 text-white">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-900/20 to-purple-900/30 p-10 shadow-2xl shadow-indigo-900/40">
        <div className="grid gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              实时洞察 · 价格守护
            </p>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                面向运营团队的
                <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-200 bg-clip-text text-transparent">
                  {" "}
                  UNIQLO 商品监控平台
                </span>
              </h1>
              <p className="text-lg text-white/70">
                Unitrack 通过准实时的 SKU 巡检、差异对比与告警，帮你第一时间洞察
                uniqlo.cn 商品价格、库存与文案变化，让运营、买手与收藏控始终领先一步。
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link href="/auth/signup">免费创建账户</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-12 rounded-full border-white/40 bg-transparent px-6 text-base text-white hover:bg-white/10"
              >
                <Link href="/dashboard">进入控制台</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="text-xs uppercase tracking-widest text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -translate-y-6 translate-x-6 rounded-[30px] bg-indigo-500/20 blur-3xl" />
            <Card className="relative h-full min-h-[360px] rounded-[24px] border-white/15 bg-white/5 backdrop-blur">
              <CardHeader>
                <CardDescription className="text-white/70">
                  即将上线 · 全自动价格与库存图谱
                </CardDescription>
                <CardTitle className="text-2xl text-white">Unitrack Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Live feed</p>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span>u0000000065241</span>
                      <span className="text-emerald-300">-10%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span>465167</span>
                      <span className="text-sky-300">补货</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span>Ultra Light Down</span>
                      <span className="text-rose-300">库存紧张</span>
                    </div>
                  </div>
                </div>
                <p>
                  数据由 Prisma + SQLite 保存，可随时迁移到 PostgreSQL。所有 API
                  响应均保留原始 JSON，便于延伸 BI 分析。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Features</p>
          <h2 className="text-3xl font-semibold text-white">为实时监控而生的产品细节</h2>
          <p className="text-white/70">
            从数据抓取、快照比对到通知链路，每一个环节都可以自定义与拓展，满足真实业务上线需求。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glow-card rounded-2xl border-white/10 bg-white/5 p-6 text-white"
            >
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="mt-3 text-base text-white/80">
                {feature.description}
              </CardDescription>
              <CardContent className="mt-4 p-0 text-sm text-white/60">{feature.detail}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="workflow" className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Workflow</p>
          <h2 className="text-3xl font-semibold text-white">四步搭建运营级监控体系</h2>
          <p className="text-white/70">
            全链路透明可追溯，可视化的流程帮助你快速拉齐团队共识。
          </p>
        </div>
        <div className="space-y-6">
          {workflow.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 lg:flex-row lg:items-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
                {index + 1}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-medium text-white">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Trust & Security</p>
          <h2 className="text-3xl font-semibold text-white">上线即可用的安全保障</h2>
          <p className="text-white/70">
            从账号安全到审计追溯，我们已经为你的首批真实用户打好地基。
          </p>
          <div className="space-y-5">
            {trustPoints.map((point) => (
              <div key={point.title} className="rounded-2xl bg-white/5 p-5">
                <h3 className="text-lg font-medium text-white">{point.title}</h3>
                <p className="mt-2 text-sm text-white/70">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="glow-card rounded-[32px] border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-purple-600/10 p-8 text-white">
          <CardHeader className="space-y-3 p-0">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">客户心声</p>
            <CardTitle className="text-2xl">“上线首周就省下了 40+ 小时人工巡检”</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-0 pt-6 text-white/80">
            <p>
              依靠 Unitrack，我们把原本散落在 Excel 的监控逻辑收敛到一个平台。团队能清楚看到每一次价格变动的上下文，策略会讨论速度也快了很多。
            </p>
            <div>
              <p className="text-base font-medium text-white">某潮流买手店 · 运营负责人</p>
              <p className="text-sm text-white/60">Beta 计划首批合作伙伴</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-800/40 p-10 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Ready to launch</p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          准备好让 UNIQLO 价格洞察变成团队标配了吗？
        </h2>
        <p className="mt-3 text-white/70">
          立即创建账户，5 分钟内搭建你的第一条商品监控链路。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild className="h-12 rounded-full px-6 text-base">
            <Link href="/auth/signup">开始免费试用</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="h-12 rounded-full border-white/40 px-6 text-base text-white hover:bg-white/10"
          >
            <Link href="/items/new">添加首个追踪</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
