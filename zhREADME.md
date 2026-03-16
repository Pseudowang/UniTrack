# Unitrack

英文文档请见：[README.md](./README.md)

Unitrack 是一个基于 Next.js App Router 的开源 UNIQLO 商品追踪应用。它支持追踪商品价格与库存变化，保存抓取快照，计算差异，并在发生有效变更时生成通知。

## 功能特性

- 用户认证（注册、登录、退出）
- 基于商品链接或商品编码追踪商品
- 支持按单个商品或全量商品触发抓取
- 保存快照并做 diff 变更检测
- 通知流水线（当前为可扩展占位实现）
- 提供追踪列表与活动信息的 Dashboard

## 技术栈

- Next.js 15（App Router, TypeScript）
- React 19
- Prisma ORM（默认 `SQLite`，兼容 PostgreSQL）
- NextAuth（Credentials 认证）
- Tailwind CSS + shadcn 风格 UI 组件
- Zod 参数校验
- Vitest 单元测试

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env`（若有 `.env.example` 可先复制），至少配置：

- `DATABASE_URL`（SQLite 示例：`file:./dev.db`）
- `NEXTAUTH_SECRET`（随机高强度字符串）

生产环境建议额外配置：

- `NEXTAUTH_URL`（线上访问地址）

### 3. 初始化数据库

```bash
npm run db:push
npm run db:seed
```

### 4. 启动开发服务

```bash
npm run dev
```

访问：`http://localhost:3000`

## 常用脚本

- `npm run dev` - 启动开发服务器（Turbopack）
- `npm run build` - 生产构建
- `npm run start` - 启动生产服务
- `npm run test` - 运行 Vitest
- `npm run db:push` - 同步 Prisma Schema 到数据库
- `npm run db:seed` - 执行 `prisma/seed.ts`
- `npm run db:studio` - 打开 Prisma Studio

## API 概览

- `POST /api/crawl/[productCode]` - 抓取某个商品编码对应的追踪项
- `POST /api/crawl/all` - 抓取全部追踪项
- `GET/POST /api/items` - 查询或新增追踪项
- `DELETE /api/items/[id]` - 删除追踪项

认证相关接口位于 `app/api/auth/*`。

## 目录结构

```text
app/
  api/                 # API 路由
  auth/                # 登录/注册页面
  dashboard/           # 登录后仪表盘
  items/new/           # 新增追踪项页面
components/            # 复用 UI 与表单组件
lib/                   # 核心逻辑（crawl/scraper/diff/notify/auth）
prisma/                # Prisma schema、迁移、seed
```

## 测试

当前测试主要覆盖 diff 逻辑：

```bash
npm run test
```

你可以在源码旁以 `*.test.ts` / `*.test.tsx` 形式补充更多测试。

## 安全建议

- 将 `/api/crawl/*` 视为高权限接口。
- 不要提交 `.env` 与任何密钥。
- 生产使用前请替换 `lib/notify.ts` 中的占位通知实现。

## 贡献指南

1. Fork 仓库并创建功能分支。
2. 变更尽量聚焦，优先补充测试。
3. 提交 PR 前执行 `npm run test`。
4. 在 PR 描述中说明动机、影响与验证步骤。

## 许可证

当前仓库尚未声明许可证。建议在公开发布前补充 `LICENSE` 文件。
