import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingDown, Bell, BarChart3, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">UniTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition">
              功能特性
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              工作原理
            </Link>
            <Link href="#benefits" className="text-muted-foreground hover:text-foreground transition">
              产品优势
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>开始使用</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
            ✨ 更聪明地追踪价格，更快地节省金钱
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance leading-tight">
            再也不会错过
            <br />
            <span className="text-primary">优衣库的促销</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            实时监控您喜爱的优衣库商品。价格下降时获得即时提醒。轻松节省优质服饰的购物成本。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                立即开始追踪
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline">
                查看工作原理
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-border overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-4 mx-auto">
              <BarChart3 className="w-10 h-10 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">智能价格追踪仪表板预览</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">为您设计的强大功能</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">追踪优衣库价格和不错过优惠所需的一切</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">实时价格追踪</h3>
              <p className="text-muted-foreground">
                全天候监控您最喜欢的优衣库商品。价格数据自动更新，实时掌握最新信息。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">即时通知提醒</h3>
              <p className="text-muted-foreground">价格下降的那一刻就收到提醒。再也不会错过任何好交易。</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">价格历史分析</h3>
              <p className="text-muted-foreground">查看详细的价格趋势和历史记录。根据数据洞察做出明智的购物决策。</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">智能收藏清单</h3>
              <p className="text-muted-foreground">构建您的个人商品清单。同时追踪多件商品，无限制添加。</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">价格下降提醒</h3>
              <p className="text-muted-foreground">设置自定义价格阈值。当商品达到您的目标价格时获得提醒。</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">省钱仪表板</h3>
              <p className="text-muted-foreground">追踪您的总省钱额。查看通过价格提醒和优惠节省的金额。</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">工作原理</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">三个简单步骤开始使用</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold mb-3">添加商品</h3>
                <p className="text-muted-foreground">粘贴优衣库商品链接或商品编码。UniTrack 立即开始监控价格变化。</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-muted-foreground text-3xl">→</div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold mb-3">我们为您监控</h3>
                <p className="text-muted-foreground">我们的系统持续监控价格变化。每天多次检查是否有任何变动。</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-muted-foreground text-3xl">→</div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold mb-3">您来省钱</h3>
                <p className="text-muted-foreground">价格下降时获得即时通知。在最佳时机购买并节省金钱。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">为什么选择 UniTrack？</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">加入成千上万位已经在省钱的聪明购物者</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-foreground/20">✓</div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">节省时间</h3>
                <p className="opacity-90">无需手动查看优衣库网站。让 UniTrack 为您自动完成。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-foreground/20">✓</div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">节省金钱</h3>
                <p className="opacity-90">即时捕捉价格下降。平均用户每月可节省 500-2000 元。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-foreground/20">✓</div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">智能通知</h3>
                <p className="opacity-90">可自定义的提醒。仅接收您关心的优惠信息。</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary-foreground/20">✓</div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">完全免费</h3>
                <p className="opacity-90">追踪无限数量的商品，完全免费。无隐藏费用或高级会员。</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-primary-foreground/20">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="opacity-90 text-sm">活跃用户</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1M+</div>
              <p className="opacity-90 text-sm">追踪商品</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">¥1亿+</div>
              <p className="opacity-90 text-sm">总省钱额</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="opacity-90 text-sm">正常运行率</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">准备好开始省钱了吗？</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            加入数千位聪明购物者。立即追踪您喜爱的优衣库商品，再也不错过任何优惠。
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              免费开始
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">产品</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    功能特性
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    定价
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    工作原理
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">公司</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    博客
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">法律</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Cookie 政策
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">社交媒体</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition">
                    Discord
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">UniTrack</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 UniTrack。保留所有权利。为热爱优惠的优衣库购物者打造。
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
