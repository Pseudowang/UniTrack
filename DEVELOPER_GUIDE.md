# UniTrack 开发指南 (Developer Guide)

这份文档旨在为新加入的开发者提供一份详尽的项目指南。通过阅读本文档，你应该能够理解项目的底层逻辑、架构设计、数据流向，甚至能够从零开始重建这个项目。

## 1. 项目简介 (Overview)

**UniTrack** 是一个最小可运行的 UNIQLO 商品价格与库存追踪系统。
**核心价值**：用户关注某个 UNIQLO 商品，系统定期抓取最新价格与库存状态，一旦发生变化（降价、补货），记录快照并通知用户。

### 1.1 核心功能
1.  **商品追踪**：用户输入 URL 或 Product ID，系统解析并添加到追踪列表。
2.  **自动抓取**：后台任务（或 API 触发）定期抓取最新数据。
3.  **变更检测**：比对“最新抓取”与“上一次快照”，生成 Diff（如：价格 199 -> 99）。
4.  **通知系统**：基于变更事件触发通知（目前为 DB 记录，可扩展邮件/短信）。

---

## 2. 技术栈 (Tech Stack)

项目采用 **Next.js App Router** 全栈架构，兼顾前后端。

| 分层 | 技术 | 选择理由 |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui | 现代化的开发体验，Server Components 优化首屏加载。 |
| **Backend** | Next.js API Routes (Route Handlers) | 与前端同构，无需额外部署后端服务。 |
| **Database** | Prisma ORM, SQLite (Dev) / Postgres (Prod) | 类型安全的数据库操作，易于迁移和维护。 |
| **Validation** | Zod | 运行时数据校验，确保 API 输入与数据库写入安全。 |
| **Auth** | NextAuth.js v5 (Beta) | 标准化的身份验证解决方案（Credentials Provider）。 |
| **Testing** | Vitest | 单元测试核心逻辑（如 Diff 算法）。 |

---

## 3. 快速上手 (Quick Start)

新环境搭建流程。

### 3.1 环境准备
确保已安装 `Node.js 18+` 和 `pnpm`。

### 3.2 安装与配置
```bash
# 1. 克隆项目
git clone <repository_url>
cd unitrack

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 DATABASE_URL 和 NEXTAUTH_SECRET
# 默认 SQLite: DATABASE_URL="file:./dev.db"
# 生成 Secret: openssl rand -base64 32

# 4. 数据库初始化
pnpm db:push   # 将 Prisma Schema 同步到数据库
pnpm db:seed   # (可选) 写入初始演示数据
```

### 3.3 启动开发环境
```bash
pnpm dev
# 访问 http://localhost:3000
# 演示账号: demo@unitrack.local / password123 (如果在 seed 中配置)
```

---

## 4. 项目架构 (Architecture)

### 4.1 目录结构
```
unitrack/
├── app/                  # Next.js App Router 核心目录
│   ├── api/              # 后端 API 接口
│   ├── auth/             # 登录/注册页面
│   ├── dashboard/        # 用户主面板（核心页面）
│   └── layout.tsx        # 全局布局
├── components/           # UI 组件
│   ├── ui/               # shadcn 基础组件 (Button, Input, Card...)
│   └── product-card.tsx  # 业务组件：商品卡片
├── lib/                  # 核心业务逻辑库 (The Brain)
│   ├── crawl.ts          # 抓取流程控制
│   ├── scraper.ts        # 爬虫/Mock 数据源
│   ├── diff.ts           # 数据比对算法
│   ├── db.ts             # Prisma Client 单例
│   └── auth.ts           # NextAuth 配置
├── prisma/               # 数据库定义
│   └── schema.prisma     # 数据模型
└── public/               # 静态资源
```

### 4.2 数据模型 (Data Model)
核心实体关系图：

```mermaid
erDiagram
    User ||--o{ TrackedItem : "关注"
    User ||--o{ Notification : "接收"
    TrackedItem ||--o{ ProductSnapshot : "历史快照"
    TrackedItem ||--o{ ChangeEvent : "变更记录"
    ProductSnapshot ||--o{ ChangeEvent : "关联"
    ChangeEvent ||--o{ Notification : "触发"

    User {
        string email
        string passwordHash
    }
    TrackedItem {
        string productCode
        string user_id
        string url
        json filters
    }
    ProductSnapshot {
        int priceCent
        boolean inStock
        string etag "唯一指纹"
    }
    ChangeEvent {
        string changeType "created/updated"
        json diff "前后差异"
    }
```

-   **TrackedItem**: 用户关注的一个商品。
-   **ProductSnapshot**: 每次抓取如果数据有变化，就存一份快照。通过 `etag` (MD5) 去重，如果数据没变则不存。
-   **ChangeEvent**: 记录两个快照之间的差异（如：价格从 199 降到 99）。

---

## 5. 核心逻辑详解 (Core Logic)

这是项目的大脑，位于 `lib/` 目录下。

### 5.1 抓取流程 (`lib/crawl.ts`)
`crawlTrackedItem(item)` 是最核心的函数。它的工作流如下：

1.  **获取最新快照** (`getLatestSnapshot`)：查库，找到该商品上一次的状态。
2.  **获取当前数据** (`fetchProduct` via `scraper.ts`)：
    *   首先尝试调用 Uniqlo 官方 API (`/data/products/prodInfo/zh_CN/`).
    *   如果 API 失败或处于开发模式且使用了 Test ID，则返回 Mock 数据。
    *   计算当前数据的 `etag` (基于标题、价格、库存计算的 MD5)。
3.  **主要路径判断**：
    *   **IF `latestSnapshot.etag === current.etag`**: 数据无变化，**直接返回** (Skipped)。
    *   **ELSE**: 数据有变化。
4.  **持久化**：
    *   写入新的 `ProductSnapshot`。
    *   更新 `TrackedItem` 的基本信息（如标题、图片，防止由于下架导致的空数据）。
5.  **Diff 生成** (`diffSnapshots` via `diff.ts`)：
    *   比对 `Latest` 和 `Current` 的字段。
    *   如果有差异，创建 `ChangeEvent` (记录 `diff` JSON)。
    *   创建 `Notification` (状态 `pending`)。
6.  **触发通知** (`notify`): 调用通知发送逻辑。

### 5.2 爬虫实现 (`lib/scraper.ts`)
*   **真实 API**: `https://www.uniqlo.cn/data/products/prodInfo/zh_CN/[CODE].json`
*   **Mock 数据**: 为了演示方便，代码中内置了几个 ID (465167, 465168) 的 Mock 数据。
*   **Etag 计算**: `md5(title | priceCent | listPriceCent | inStock)`。这是判断“是否变化”的唯一标准。

---

## 6. API 接口文档 (API Reference)

所有 API 均需要登录 (Session Cookie)。

### 6.1 添加追踪
*   **Endpoint**: `POST /api/items`
*   **功能**: 解析 URL 或编码，将商品加入追踪列表。
*   **Request**:
    ```json
    { "value": "https://www.uniqlo.cn/product-detail.html?productCode=u000000000465167" }
    // 或纯编码
    { "value": "465167" }
    ```
*   **Logic**:
    1.  校验输入格式。
    2.  解析出 `productCode`。
    3.  调用 API 验证商品是否存在（可选，目前主要是解析）。
    4.  写入 `TrackedItem` 表。如果已存在，返回 `200` (message: "already-tracking")。

### 6.2 触发全量抓取
*   **Endpoint**: `POST /api/crawl/all`
*   **功能**: 遍历系统中所有的 `TrackedItem` 并执行抓取。
*   **Response**:
    ```json
    {
      "total": 10,
      "created": 2, // 发现并更新了 2 个商品
      "skipped": 8, // 8 个商品无变化
      "results": [...]
    }
    ```
*   **注意**: 这是一个同步接口，如果商品很多会超时。生产环境应改为触发异步队列（如 BullMQ / Inngest）。当前实现为了防止封禁，每两个请求间有随机延迟 (500ms - 1500ms)。

---

## 7. 前端实现 (Frontend)

### 7.1 Dashboard (`app/dashboard/page.tsx`)
这是一个 **React Server Component (RSC)**。
*   **数据获取**: 直接在组件内 `prisma.trackedItem.findMany()`。这是 Next.js 15 的推荐模式，无需 API 中转。
*   **页面结构**:
    *   顶部：`AddItemForm` (Client Component) 用于添加。
    *   中部：`CrawlAllButton` (Client Component) 调用 `/api/crawl/all`。
    *   底部：`ProductCard` Grid 列表。

### 7.2 商品卡片 (`components/product-card.tsx`)
*   **Props**: 接收 `TrackedItem` (包含最新的 `snapshots[0]`)。
*   **UI**:
    *   根据 `snapshots[0]` 显示当前价格。
    *   如果 `priceCent < listPriceCent`，显示折扣样式。
    *   如果 `inStock` 为 false，显示缺货置灰。

---

## 8. 扩展与维护指南

### 如何添加新的通知渠道？
1.  修改 `prisma/schema.prisma` 中的 `Notification` 模型，添加需要的字段（如 `phone`）。
2.  运行 `pnpm db:push`。
3.  编辑 `lib/notify.ts` (目前可能是占位符)。
4.  在 `lib/crawl.ts` 的最后一步调用新的发送逻辑。

### 如何切换到 PostgreSQL？
UniTrack 默认配置为兼容 Postgres。
1.  修改 `.env` 中的 `DATABASE_URL` 格式：
    `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
2.  运行 `pnpm db:push` 同步结构。
3.  项目代码无需修改，Prisma 会自动适配。

### 常见问题排查
*   **抓取一直是 mock 数据？**
    *   检查代码中 `fetchProduct` 逻辑，非 Mock ID 会尝试请求真实 API。如果真实 API 也是 Mock 响应，可能是网络问题导致 fallback。
*   **Prisma 报错 `P2002` (Unique constraint)**？
    *   通常发生在 `ProductSnapshot` 写入时。`crawl.ts` 中使用了 `upsert` 配合 `etag` 来解决并发重复写入的问题。

---

这份文档涵盖了从环境搭建到核心代码逻辑的方方面面。按照此文档，你应该能够完全掌握 UniTrack 的运行机制。
