# Unitrack Demo

最小可运行的 UNIQLO 商品追踪演示项目，展示如何使用 Next.js App Router、Prisma、NextAuth 与 shadcn/ui 搭建登录、数据抓取与通知流。

## 技术栈

- Next.js 15（App Router, TypeScript）
- Tailwind CSS 4 + shadcn/ui 组件
- Prisma ORM（默认 SQLite，兼容 PostgreSQL）
- NextAuth.js Credentials Provider（邮箱 + 本地密码）
- Zod 校验、Vitest 单元测试

## 快速开始

1. 安装依赖

   ```bash
   pnpm install
   ```

2. 配置环境变量

   ```bash
    cp .env.example .env
   ```

   - 默认使用 SQLite：`DATABASE_URL="file:./dev.db"`
   - Postgres 示例：`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unitrack?schema=public"`
   - 设置 `NEXTAUTH_SECRET` 为随机字符串

3. 初始化数据库

   ```bash
   pnpm db:push      # 或使用 prisma migrate 以创建迁移
   pnpm db:seed      # 可选：写入 demo 用户与 1 条 TrackedItem
   ```

4. 启动开发服务

   ```bash
   pnpm dev
   ```

5. 打开 [http://localhost:3000](http://localhost:3000) 体验：
   - `/auth/signup` 注册
   - `/auth/signin` 登录（种子用户：`demo@unitrack.local` / `password123`）
   - `/dashboard` 查看追踪清单与通知
   - `/items/new` 添加新的追踪商品

## 常用脚本

| Script | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Next.js 开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm db:push` | 将 Prisma 模型同步到数据库 |
| `pnpm db:studio` | 打开 Prisma Studio |
| `pnpm db:seed` | 执行 `prisma/seed.ts` 种子脚本 |
| `pnpm test` | 运行 Vitest 单元测试 |

## 目录结构摘要

```
app/               // App Router 页面与 API
  api/crawl/*      // 伪爬虫 API（all、[productCode]）
  auth/*           // 登录/注册页面
  dashboard/       // 已登录用户面板
  items/new/       // 添加追踪商品
components/        // shadcn 风格 UI 与表单组件
lib/               // Prisma 客户端、mock 爬虫、diff、notify 等
prisma/            // Prisma schema 与 seed 脚本
```

## Mock 抓取逻辑

- `/lib/scraper.ts`：解析 uniqlo.cn 链接/productCode，生成 mock 商品数据并计算 etag（`md5(title|priceCent|listPriceCent|inStock)`）。
- `/lib/diff.ts`：比对前后快照，生成变更 diff。
- `/lib/crawl.ts`：组合抓取、写入 `ProductSnapshot`，当数据变动时创建 `ChangeEvent` 与 `Notification(status=pending)`，并调用 `notify()` 占位函数。
- API：
  - `POST /api/crawl/[productCode]`：对单个 productCode 的所有 TrackedItem 触发抓取。
  - `POST /api/crawl/all`：遍历全部 TrackedItem。

## Prisma Schema 摘要

- `User`: `email`, `passwordHash`, `createdAt`
- `TrackedItem`: `productCode`, `url`, `title?`, `imageUrl?`, `filters?`
- `ProductSnapshot`: `fetchedAt`, `priceCent?`, `listPriceCent?`, `inStock?`, `rawJson`, `etag`
- `ChangeEvent`: `changeType`, `diff`, `createdAt`
- `Notification`: `channel`, `status`, `sendAt?`, `meta`

详见 `prisma/schema.prisma`。

## 测试

Vitest 覆盖 `lib/diff.ts` 的核心 diff 逻辑：

```bash
pnpm test
```

> 如需扩展更多测试，可在 `lib/__tests__` 下添加。

## 生产注意事项

- 替换 `notify()` 中的逻辑以接入真实通知渠道（邮件、短信等）。
- 在生产环境使用 NextAuth 时需配置稳定的 `NEXTAUTH_SECRET` 与 HTTPS `NEXTAUTH_URL`。
- 若切换到 Postgres，请更新 `.env` 中的 `DATABASE_URL`，并执行 `pnpm db:push` 或迁移。
