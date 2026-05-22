# UniTrack 项目重构计划

## 项目背景与目标

### 当前状态
UniTrack 是一个优衣库商品价格追踪应用，使用 Next.js 15 App Router、React 19、Prisma ORM、NextAuth 构建。项目整体架构清晰，但存在大量未使用代码、重复组件和不规范的实现。

### 重构目标
将 UniTrack 重构为一个**标准、规范、高可读性**的 Next.js 教学项目，让学生能够通过这个项目深入学习 Next.js 技术栈的最佳实践。

### 核心原则
1. **符合 Next.js 15 官方最佳实践**
2. **代码简洁、可读性强、注释完善**
3. **架构清晰、职责分离、易于理解**
4. **删除所有未使用代码**
5. **统一代码风格和命名规范**
6. **完善的类型安全和错误处理**

---

## 一、项目现状分析

### 1.1 技术栈
- **前端**: Next.js 15.5.7 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS 4, Radix UI, shadcn/ui, Lucide Icons
- **后端**: Next.js API Routes, Prisma ORM (PostgreSQL/SQLite)
- **认证**: NextAuth 5 (Credentials Provider)
- **验证**: Zod
- **测试**: Vitest
- **动画**: Framer Motion

### 1.2 项目结构
```
unitrack/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── auth/              # 认证页面
│   ├── dashboard/         # 控制台
│   ├── items/new/         # 添加商品页
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页 (405行 - 过长)
├── components/            # React 组件
│   ├── ui/               # 56个 shadcn/ui 组件 (30+未使用)
│   ├── forms/            # 表单组件
│   └── hero/             # 首页组件
├── lib/                   # 业务逻辑
│   ├── auth.ts           # NextAuth 配置
│   ├── crawl.ts          # 爬虫核心
│   ├── scraper.ts        # 数据抓取
│   ├── diff.ts           # 快照对比
│   ├── notify.ts         # 通知 (未实现)
│   └── validators.ts     # Zod schemas
├── prisma/               # 数据库
│   ├── schema.prisma     # 数据模型
│   └── seed.ts           # 种子数据
└── hooks/                # 自定义 Hooks
```

### 1.3 核心功能
1. **用户认证**: 注册、登录、登出
2. **商品追踪**: 添加、删除、查看追踪商品
3. **价格监控**: 定期抓取商品数据，检测价格变化
4. **快照存储**: 保存历史数据，支持对比
5. **通知系统**: 价格变化时通知用户 (未实现)

---

## 二、主要问题清单

### 🔴 严重问题 (必须修复)

#### 2.1 大量未使用的 UI 组件
**问题描述:**
- 56个 shadcn/ui 组件中，有 30+ 个完全未使用
- 估计约 5000+ 行未使用代码
- 影响包体积、构建时间、维护成本

**未使用组件列表:**
```
components/ui/
├── sidebar.tsx (726行)
├── chart.tsx (353行)
├── menubar.tsx (276行)
├── context-menu.tsx (252行)
├── field.tsx (244行)
├── carousel.tsx (241行)
├── calendar.tsx (213行)
├── item.tsx (193行)
├── select.tsx (185行)
├── command.tsx (184行)
├── navigation-menu.tsx (166行)
├── accordion.tsx
├── alert-dialog.tsx
├── aspect-ratio.tsx
├── breadcrumb.tsx
├── button-group.tsx
├── checkbox.tsx
├── collapsible.tsx
├── drawer.tsx
├── empty.tsx
├── form.tsx
├── hover-card.tsx
├── input-otp.tsx
├── kbd.tsx
├── pagination.tsx
├── progress.tsx
├── radio-group.tsx
├── resizable.tsx
├── scroll-area.tsx
├── skeleton.tsx
├── slider.tsx
├── sonner.tsx
├── spinner.tsx
├── switch.tsx
├── table.tsx
├── tabs.tsx
├── toggle-group.tsx
└── use-mobile.tsx
```

**实际使用的组件 (仅12个):**
- button, input, label, card, badge, alert
- dialog, popover, toast, toaster
- separator, textarea, toggle, sheet

**解决方案:**
删除所有未使用的 UI 组件文件

---

#### 2.2 重复的表单组件
**问题描述:**
- `AddItemForm` (86行) 和 `NewItemForm` (134行) 功能重复
- 都实现添加追踪商品功能，仅显示方式不同
- 导致代码维护困难、功能不一致

**对比分析:**
| 特性 | AddItemForm | NewItemForm |
|------|-------------|-------------|
| 使用位置 | Dashboard 页面 | items/new 页面 |
| 布局 | 横向表单 | 纵向表单 |
| 预览功能 | ❌ 无 | ✅ 有图片预览 |
| 反馈方式 | Toast 通知 | 内联消息 |
| 状态管理 | useState | useTransition |
| 代码行数 | 86行 | 134行 |

**解决方案:**
合并为一个 `TrackedItemForm` 组件，通过 props 控制显示模式

---

#### 2.3 未使用的业务组件
**问题描述:**
- `mobile-nav.tsx` (172行) 完整实现但从未导入使用
- 项目使用 `sheet` 组件实现移动端导航

**解决方案:**
删除 `mobile-nav.tsx` 文件

---

#### 2.4 首页组件过长
**问题描述:**
- `app/page.tsx` 有 405 行代码
- 包含所有营销内容在一个文件中
- 缺乏组件拆分，可读性差

**当前结构:**
```tsx
// app/page.tsx (405行)
export default function Home() {
  return (
    <>
      {/* Hero Section - 40行 */}
      {/* Features Section - 80行 */}
      {/* How it works Section - 60行 */}
      {/* Benefits Section - 70行 */}
      {/* Testimonials Section - 50行 */}
      {/* FAQ Section - 80行 */}
      {/* CTA Section - 25行 */}
    </>
  );
}
```

**解决方案:**
拆分为独立的 section 组件

---

#### 2.5 未使用的依赖包
**问题描述:**
- 安装了 `react-hook-form` 和 `@hookform/resolvers` 但未使用
- 所有表单都用 `useState` + Zod 实现
- `components/ui/form.tsx` 提供了 RHF 集成但未被使用

**解决方案:**
移除未使用的依赖，或者重构表单使用 React Hook Form

---

### 🟡 中等问题 (建议修复)

#### 2.6 硬编码值未提取为常量
**问题位置:**
- `lib/scraper.ts:6` - UNIQLO API 基础 URL
- `app/api/crawl/all/route.ts:30` - 随机延迟范围 (500-1500ms)
- `hooks/use-toast.ts:8-9` - Toast 限制和延迟

**解决方案:**
创建 `lib/constants.ts` 统一管理常量

---

#### 2.7 类型定义不完整
**问题描述:**
- `TrackedItem.filters` 使用 `Json?` 类型，实际使用时强制转换为 `any`
- 部分组件使用 `any` 类型
- API 响应缺少统一类型定义

**解决方案:**
完善 TypeScript 类型定义，创建 `types/` 目录

---

#### 2.8 错误处理不规范
**问题描述:**
- 错误消息混合中英文
- 缺少错误代码/类型字段
- 无结构化日志
- `lib/crawl.ts:76-78` - catch 块直接 throw，没有日志

**解决方案:**
统一错误处理格式，添加错误代码

---

#### 2.9 缺少 Loading 和 Error 边界
**问题描述:**
- 缺少 `loading.tsx` 文件
- 缺少 `error.tsx` 文件
- 用户体验不完整

**解决方案:**
为关键路由添加 loading.tsx 和 error.tsx

---

#### 2.10 数据库查询未优化
**问题描述:**
- `/api/crawl/all` 查询所有商品无分页
- Dashboard 加载所有追踪商品无限制
- 存在 N+1 查询问题

**解决方案:**
添加分页、限制查询数量

---

### 🟢 优化建议 (长期改进)

#### 2.11 缺少测试覆盖
**问题描述:**
- 只有 1 个测试文件 (`lib/__tests__/diff.test.ts`)
- 核心爬虫逻辑、API 路由、组件都没有测试

**解决方案:**
添加单元测试和集成测试

---

#### 2.12 通知系统未实现
**问题描述:**
- `lib/notify.ts` 只是空函数
- 数据库中创建了 Notification 记录但从未发送

**解决方案:**
实现邮件或推送通知功能

---

#### 2.13 环境变量配置不一致
**问题描述:**
- `.env.example` 显示支持 SQLite 和 PostgreSQL
- `prisma/schema.prisma` 配置为 PostgreSQL
- 可能导致新开发者配置困惑

**解决方案:**
统一数据库配置说明

---

#### 2.14 控制台日志残留
**问题位置:**
- `lib/scraper.ts` - 开发日志
- `lib/notify.ts` - 开发日志
- `prisma/seed.ts` - 种子脚本日志

**解决方案:**
移除或使用专业日志库

---

#### 2.15 缺少 API 文档
**问题描述:**
- API 路由缺少注释和文档
- 请求/响应格式不明确

**解决方案:**
添加 JSDoc 注释或使用 OpenAPI

---

## 三、重构计划详细步骤

### 阶段一：代码清理 (优先级: 🔴 最高)

#### 步骤 1.1: 删除未使用的 UI 组件
**目标:** 删除 30+ 个未使用的 shadcn/ui 组件，减少约 5000 行代码

**操作清单:**
```bash
# 删除以下文件
rm components/ui/sidebar.tsx
rm components/ui/chart.tsx
rm components/ui/menubar.tsx
rm components/ui/context-menu.tsx
rm components/ui/field.tsx
rm components/ui/carousel.tsx
rm components/ui/calendar.tsx
rm components/ui/item.tsx
rm components/ui/select.tsx
rm components/ui/command.tsx
rm components/ui/navigation-menu.tsx
rm components/ui/accordion.tsx
rm components/ui/alert-dialog.tsx
rm components/ui/aspect-ratio.tsx
rm components/ui/breadcrumb.tsx
rm components/ui/button-group.tsx
rm components/ui/checkbox.tsx
rm components/ui/collapsible.tsx
rm components/ui/drawer.tsx
rm components/ui/empty.tsx
rm components/ui/form.tsx
rm components/ui/hover-card.tsx
rm components/ui/input-otp.tsx
rm components/ui/kbd.tsx
rm components/ui/pagination.tsx
rm components/ui/progress.tsx
rm components/ui/radio-group.tsx
rm components/ui/resizable.tsx
rm components/ui/scroll-area.tsx
rm components/ui/skeleton.tsx
rm components/ui/slider.tsx
rm components/ui/sonner.tsx
rm components/ui/spinner.tsx
rm components/ui/switch.tsx
rm components/ui/table.tsx
rm components/ui/tabs.tsx
rm components/ui/toggle-group.tsx
rm components/ui/use-mobile.tsx
```

**保留的 UI 组件 (12个):**
- button.tsx
- input.tsx
- label.tsx
- card.tsx
- badge.tsx
- alert.tsx
- dialog.tsx
- popover.tsx
- toast.tsx
- toaster.tsx
- separator.tsx
- textarea.tsx
- toggle.tsx
- sheet.tsx
- input-group.tsx
- avatar.tsx
- dropdown-menu.tsx
- tooltip.tsx

**验证方法:**
```bash
# 检查是否有导入错误
npm run build
```

---

#### 步骤 1.2: 删除未使用的业务组件
**目标:** 删除 `mobile-nav.tsx` 文件

**操作:**
```bash
rm components/mobile-nav.tsx
```

**验证:**
```bash
# 搜索是否有引用
grep -r "mobile-nav" app/ components/
```

---

#### 步骤 1.3: 移除未使用的依赖
**目标:** 清理 package.json 中未使用的依赖

**操作:**
```bash
# 移除 React Hook Form (如果决定不使用)
npm uninstall react-hook-form @hookform/resolvers

# 或者保留并在后续步骤中使用
```

**决策点:**
- 选项 A: 移除 RHF，继续使用 useState
- 选项 B: 保留 RHF，重构表单使用它 (推荐用于教学)

**推荐:** 选项 B - 保留并使用 RHF，因为这是 Next.js 项目的最佳实践

---


### 阶段二：组件重构 (优先级: 🔴 高)

#### 步骤 2.1: 合并重复的表单组件
**目标:** 将 AddItemForm 和 NewItemForm 合并为一个可复用组件

**新组件设计:**
```tsx
// components/tracked-item-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackedItemPayloadSchema } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";

interface TrackedItemFormProps {
  variant?: "inline" | "full";
  showPreview?: boolean;
  onSuccess?: () => void;
}

export function TrackedItemForm({
  variant = "full",
  showPreview = false,
  onSuccess,
}: TrackedItemFormProps) {
  // 实现合并后的逻辑
}
```

**操作步骤:**
1. 创建 `components/tracked-item-form.tsx`
2. 合并两个表单的功能
3. 支持 inline 和 full 两种显示模式
4. 支持可选的图片预览功能
5. 更新 Dashboard 和 items/new 页面引用
6. 删除旧的 `add-item-form.tsx` 和 `forms/new-item-form.tsx`

**验证:**
```bash
# 测试两个页面的表单功能
# 1. 访问 /dashboard - 测试 inline 模式
# 2. 访问 /items/new - 测试 full 模式
```

---

#### 步骤 2.2: 拆分首页组件
**目标:** 将 405 行的 app/page.tsx 拆分为多个独立组件

**新组件结构:**
```
components/landing/
├── hero-section.tsx          # Hero 区域
├── features-section.tsx      # 功能特性
├── how-it-works-section.tsx  # 工作原理
├── benefits-section.tsx      # 优势说明
├── testimonials-section.tsx  # 用户评价
├── faq-section.tsx          # 常见问题
└── cta-section.tsx          # 行动号召
```

**重构后的 app/page.tsx:**
```tsx
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CTASection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <div className="w-full bg-background">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
```

**操作步骤:**
1. 创建 `components/landing/` 目录
2. 提取每个 section 为独立组件
3. 保持原有样式和功能
4. 更新 app/page.tsx 引用
5. 删除 `components/hero/` 目录（合并到 landing）

---

#### 步骤 2.3: 添加 Loading 和 Error 边界
**目标:** 为关键路由添加加载和错误处理

**需要添加的文件:**
```
app/
├── loading.tsx              # 全局加载
├── error.tsx               # 全局错误
├── dashboard/
│   ├── loading.tsx         # Dashboard 加载
│   └── error.tsx          # Dashboard 错误
├── items/new/
│   ├── loading.tsx         # 添加商品加载
│   └── error.tsx          # 添加商品错误
└── auth/
    ├── signin/
    │   └── loading.tsx     # 登录加载
    └── signup/
        └── loading.tsx     # 注册加载
```

**loading.tsx 示例:**
```tsx
// app/dashboard/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
```

**error.tsx 示例:**
```tsx
// app/dashboard/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto py-8">
      <Alert variant="destructive">
        <AlertTitle>出错了</AlertTitle>
        <AlertDescription>
          加载控制台时发生错误，请稍后重试。
        </AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4">
        重试
      </Button>
    </div>
  );
}
```

---

### 阶段三：代码规范化 (优先级: 🟡 中)

#### 步骤 3.1: 提取常量配置
**目标:** 将硬编码值提取为常量

**创建 lib/constants.ts:**
```typescript
// lib/constants.ts

/**
 * UNIQLO API 配置
 */
export const UNIQLO_API = {
  BASE_URL: "https://www.uniqlo.cn/data/products/prodInfo/zh_CN/",
  CDN_URL: "https://www.uniqlo.cn/hmall/test/u0000000000000/",
  TIMEOUT: 10000, // 10秒超时
} as const;

/**
 * 爬虫配置
 */
export const CRAWLER_CONFIG = {
  DELAY_MIN: 500,  // 最小延迟 (ms)
  DELAY_MAX: 1500, // 最大延迟 (ms)
  BATCH_SIZE: 10,  // 批处理大小
  MAX_RETRIES: 3,  // 最大重试次数
} as const;

/**
 * Toast 通知配置
 */
export const TOAST_CONFIG = {
  MAX_TOASTS: 3,
  DURATION: 5000, // 5秒
} as const;

/**
 * 分页配置
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * 认证配置
 */
export const AUTH_CONFIG = {
  MIN_PASSWORD_LENGTH: 8,
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30天
} as const;
```

**更新引用:**
```typescript
// lib/scraper.ts
import { UNIQLO_API } from "./constants";

export const UNIQLO_SPU_API_BASE = UNIQLO_API.BASE_URL;
```

---

#### 步骤 3.2: 完善类型定义
**目标:** 创建统一的类型定义文件

**创建 types/ 目录:**
```
types/
├── index.ts           # 导出所有类型
├── api.ts            # API 相关类型
├── database.ts       # 数据库类型扩展
└── components.ts     # 组件 Props 类型
```

**types/api.ts:**
```typescript
// types/api.ts

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * API 错误类型
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```


**types/database.ts:**
```typescript
// types/database.ts
import type { TrackedItem, ProductSnapshot, ChangeEvent, Notification } from "@prisma/client";

/**
 * TrackedItem 包含最新快照
 */
export type TrackedItemWithSnapshot = TrackedItem & {
  snapshots: ProductSnapshot[];
};

/**
 * ChangeEvent 包含关联数据
 */
export type ChangeEventWithRelations = ChangeEvent & {
  trackedItem: TrackedItem;
  snapshot: ProductSnapshot;
};

/**
 * Notification 包含关联数据
 */
export type NotificationWithRelations = Notification & {
  changeEvent: ChangeEventWithRelations;
};

/**
 * TrackedItem.filters 类型定义
 */
export interface TrackedItemFilters {
  targetPrice?: number;
  notifyOnPriceChange?: boolean;
  notifyOnStockChange?: boolean;
}
```

---

#### 步骤 3.3: 统一错误处理
**目标:** 创建统一的错误处理机制

**创建 lib/errors.ts:**
```typescript
// lib/errors.ts

/**
 * 应用错误代码
 */
export enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  
  // 验证错误
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  
  // 资源错误
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  
  // 业务错误
  CRAWL_FAILED = "CRAWL_FAILED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  
  // 系统错误
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
}

/**
 * 应用错误类
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * 错误响应格式化
 */
export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  // 未知错误
  console.error("Unexpected error:", error);
  return {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: "服务器内部错误",
    },
  };
}
```

**创建 lib/api-response.ts:**
```typescript
// lib/api-response.ts
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";

/**
 * 成功响应
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 错误响应
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}
```

**更新 API 路由示例:**
```typescript
// app/api/items/route.ts (重构后)
import { auth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ErrorCode } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse(
        ErrorCode.UNAUTHORIZED,
        "请先登录",
        401
      );
    }

    const json = await request.json();
    const parsed = trackedItemPayloadSchema.safeParse(json);
    
    if (!parsed.success) {
      return errorResponse(
        ErrorCode.VALIDATION_ERROR,
        "输入数据不合法",
        400,
        { errors: parsed.error.errors }
      );
    }

    // 业务逻辑...
    const item = await createTrackedItem(parsed.data);

    return successResponse(item, "添加成功", 201);
  } catch (error) {
    console.error("Create tracked item error:", error);
    return errorResponse(
      ErrorCode.INTERNAL_ERROR,
      "创建失败，请稍后重试",
      500
    );
  }
}
```

---

#### 步骤 3.4: 添加代码注释和文档
**目标:** 为关键函数和组件添加 JSDoc 注释

**注释规范:**
```typescript
/**
 * 抓取追踪商品的最新数据
 * 
 * @param trackedItem - 要抓取的追踪商品
 * @returns 抓取结果，包含快照、变化事件和通知
 * 
 * @example
 * ```typescript
 * const result = await crawlTrackedItem(item);
 * if (!result.skipped) {
 *   console.log("检测到变化:", result.changeEvent);
 * }
 * ```
 */
export async function crawlTrackedItem(
  trackedItem: TrackedItem
): Promise<CrawlResult> {
  // 实现...
}
```

**需要添加注释的文件:**
- `lib/crawl.ts` - 爬虫核心逻辑
- `lib/scraper.ts` - 数据抓取
- `lib/diff.ts` - 快照对比
- `lib/auth.ts` - 认证配置
- `lib/validators.ts` - 验证规则
- 所有 API 路由文件

---

#### 步骤 3.5: 统一命名规范
**目标:** 确保代码遵循一致的命名规范

**命名规范:**
```typescript
// ✅ 组件名：PascalCase
export function ProductCard() {}

// ✅ 函数名：camelCase
export function fetchProduct() {}

// ✅ 常量：UPPER_SNAKE_CASE
export const API_BASE_URL = "...";

// ✅ 类型/接口：PascalCase
export interface TrackedItem {}
export type ApiResponse<T> = {};

// ✅ 文件名：kebab-case
// tracked-item-form.tsx
// api-response.ts
// use-toast.ts

// ✅ 目录名：kebab-case
// components/landing/
// lib/utils/
```

**需要重命名的文件:**
```bash
# 检查不符合规范的文件名
find . -name "*.tsx" -o -name "*.ts" | grep -E "[A-Z]"
```

---

### 阶段四：功能完善 (优先级: 🟡 中)

#### 步骤 4.1: 实现通知系统
**目标:** 完善 lib/notify.ts，实现真实的通知功能

**选项 A: 邮件通知 (推荐用于教学)**
```typescript
// lib/notify.ts
import { Resend } from "resend";
import type { Notification } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notify(notification: Notification) {
  try {
    // 获取用户邮箱
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 发送邮件
    await resend.emails.send({
      from: "UniTrack <noreply@unitrack.com>",
      to: user.email,
      subject: "商品价格变化提醒",
      html: generateEmailHTML(notification),
    });

    // 更新通知状态
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: "sent",
        sendAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Notification error:", error);
    
    // 更新为失败状态
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "failed" },
    });
  }
}
```

**选项 B: 应用内通知 (简化版)**
```typescript
// lib/notify.ts
export async function notify(notification: Notification) {
  // 仅更新数据库状态，前端轮询获取
  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: "sent",
      sendAt: new Date(),
    },
  });
}
```

---

#### 步骤 4.2: 添加分页功能
**目标:** 为 Dashboard 和 API 添加分页支持

**更新 API 路由:**
```typescript
// app/api/items/route.ts
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCode.UNAUTHORIZED, "请先登录", 401);
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  const [items, total] = await Promise.all([
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
  ]);

  return successResponse({
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}
```

      },
    });

    return { success: true };
  } catch (error) {
    console.error("Notification error:", error);
    
    // 更新为失败状态
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "failed" },
    });

    return { success: false, error };
  }
}

/**
 * 生成邮件 HTML
 */
function generateEmailHTML(notification: Notification): string {
  const meta = notification.meta as { summary?: Record<string, unknown> };
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>商品价格变化提醒</title>
      </head>
      <body>
        <h1>您追踪的商品有变化</h1>
        <p>变化详情：</p>
        <pre>${JSON.stringify(meta.summary, null, 2)}</pre>
        <p>
          <a href="${process.env.NEXTAUTH_URL}/dashboard">
            查看详情
          </a>
        </p>
      </body>
    </html>
  `;
}
```

**选项 B: 应用内通知 (简化版)**
```typescript
// lib/notify.ts
import prisma from "./db";
import type { Notification } from "@prisma/client";

/**
 * 标记通知为已发送（应用内通知）
 */
export async function notify(notification: Notification) {
  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: "sent",
      sendAt: new Date(),
    },
  });

  // 可以在这里添加 WebSocket 推送等实时通知
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[notify] 通知已创建: ${notification.id} for user ${notification.userId}`
    );
  }

  return { success: true };
}
```

**环境变量配置:**
```bash
# .env
RESEND_API_KEY=re_xxxxx  # 如果使用邮件通知
```

---

#### 步骤 4.2: 添加数据库查询优化
**目标:** 优化 N+1 查询和添加分页

**优化 /api/crawl/all:**
```typescript
// app/api/crawl/all/route.ts (优化后)
import { auth } from "@/lib/auth";
import { crawlTrackedItem } from "@/lib/crawl";
import prisma from "@/lib/db";
import { CRAWLER_CONFIG } from "@/lib/constants";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 批量获取所有追踪商品（带最新快照）
    const trackedItems = await prisma.trackedItem.findMany({
      include: {
        snapshots: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    });

    const results = [];
    
    // 分批处理，避免并发过高
    for (let i = 0; i < trackedItems.length; i += CRAWLER_CONFIG.BATCH_SIZE) {
      const batch = trackedItems.slice(i, i + CRAWLER_CONFIG.BATCH_SIZE);
      
      // 并发处理一批
      const batchResults = await Promise.allSettled(
        batch.map((item) => crawlTrackedItem(item))
      );

      results.push(...batchResults);

      // 批次间延迟
      if (i + CRAWLER_CONFIG.BATCH_SIZE < trackedItems.length) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.random() * (CRAWLER_CONFIG.DELAY_MAX - CRAWLER_CONFIG.DELAY_MIN) +
              CRAWLER_CONFIG.DELAY_MIN
          )
        );
      }
    }

    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return Response.json(summary);
  } catch (error) {
    console.error("Crawl all error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
```

**优化 Dashboard 查询:**
```typescript
// app/dashboard/page.tsx (优化后)
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // 使用分页和限制
  const [trackedItems, notifications, stats] = await Promise.all([
    // 限制返回数量
    prisma.trackedItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // 最多显示50个
      include: {
        snapshots: {
          orderBy: { fetchedAt: "desc" },
          take: 1,
        },
      },
    }),
    // 限制通知数量
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
    // 获取统计数据
    prisma.trackedItem.count({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <div>
      <p>共追踪 {stats} 个商品，显示最近 {trackedItems.length} 个</p>
      {/* 渲染内容 */}
    </div>
  );
}
```

---

#### 步骤 4.3: 增强密码安全
**目标:** 提升密码策略和安全性

**更新 lib/validators.ts:**
```typescript
// lib/validators.ts
import { z } from "zod";

/**
 * 密码验证规则
 * - 最少 8 位
 * - 至少包含一个大写字母
 * - 至少包含一个小写字母
 * - 至少包含一个数字
 */
const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 位")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");

export const signUpSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});
```

**增加 bcrypt 轮数:**
```typescript
// app/api/auth/signup/route.ts
import { hash } from "bcryptjs";

// 从 10 增加到 12
const passwordHash = await hash(parsed.data.password, 12);
```

---

#### 步骤 4.4: 添加速率限制
**目标:** 防止 API 滥用

**安装依赖:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**创建 lib/rate-limit.ts:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 创建 Redis 客户端
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 创建速率限制器
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10秒内最多10次请求
  analytics: true,
});

/**
 * 检查速率限制
 */
export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(
    identifier
  );

  return {
    success,
    limit,
    reset,
    remaining,
  };
}
```

**应用到 API 路由:**
```typescript
// app/api/items/route.ts
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse(ErrorCode.UNAUTHORIZED, "请先登录", 401);
  }

  // 速率限制检查
  const { success, reset } = await checkRateLimit(session.user.id);
  if (!success) {
    return errorResponse(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `请求过于频繁，请在 ${new Date(reset).toLocaleTimeString()} 后重试`,
      429
    );
  }

  // 业务逻辑...
}
```

**环境变量:**
```bash
# .env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

---

### 阶段五：文档和测试 (优先级: 🟢 低)

#### 步骤 5.1: 完善项目文档
**目标:** 创建完整的项目文档

**更新 README.md:**
```markdown
# UniTrack - 优衣库商品价格追踪系统

> 一个基于 Next.js 15 的全栈价格追踪应用，用于学习 Next.js App Router 最佳实践

## 📚 学习目标

通过这个项目，你将学习到：

1. **Next.js 15 App Router**
   - 服务器组件 vs 客户端组件
   - 路由组织和布局
   - API Routes 实现
   - Loading 和 Error 边界

2. **数据库操作**
   - Prisma ORM 使用
   - 数据模型设计
   - 关系查询优化
   - 事务处理

3. **认证授权**
   - NextAuth 5 集成
   - JWT Session 管理
   - 路由保护

4. **表单处理**
   - React Hook Form
   - Zod 验证
   - 服务端验证

5. **UI 开发**
   - Tailwind CSS
   - Radix UI 组件
   - 响应式设计
   - 暗色模式

## 🚀 快速开始

### 前置要求
- Node.js 18+
- PostgreSQL 或 SQLite
- npm 或 pnpm

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/your-username/unitrack.git
cd unitrack
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

4. 初始化数据库
```bash
npm run db:push
npm run db:seed
```

5. 启动开发服务器
```bash
npm run dev
```

6. 访问 http://localhost:3000

## 📖 项目结构

详见 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 🧪 测试

```bash
npm run test
```

## 📝 API 文档

详见 [API.md](./docs/API.md)

## 🤝 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

MIT License
```

ring): Promise<boolean> {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

**应用到 API 路由:**
```typescript
// app/api/auth/signup/route.ts (添加速率限制)
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // 获取客户端 IP
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  
  // 检查速率限制
  const allowed = await checkRateLimit(`signup:${ip}`);
  if (!allowed) {
    return errorResponse(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      "请求过于频繁，请稍后再试",
      429
    );
  }

  // 继续处理注册逻辑...
}
```

**环境变量:**
```bash
# .env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

---

### 阶段五：测试和文档 (优先级: 🟢 低)

#### 步骤 5.1: 添加单元测试
**目标:** 为核心业务逻辑添加测试

**测试文件结构:**
```
lib/__tests__/
├── diff.test.ts          # ✅ 已存在
├── crawl.test.ts         # 新增
├── scraper.test.ts       # 新增
├── validators.test.ts    # 新增
└── product-code.test.ts  # 新增
```

**示例测试 - lib/__tests__/crawl.test.ts:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { crawlTrackedItem } from "../crawl";
import type { TrackedItem } from "@prisma/client";

// Mock dependencies
vi.mock("../db", () => ({
  default: {
    productSnapshot: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    trackedItem: {
      update: vi.fn(),
    },
    changeEvent: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../scraper", () => ({
  fetchProduct: vi.fn(),
}));

describe("crawlTrackedItem", () => {
  const mockTrackedItem: TrackedItem = {
    id: "test-id",
    userId: "user-id",
    productCode: "465167",
    url: "https://www.uniqlo.cn/product/465167",
    title: "Test Product",
    imageUrl: null,
    createdAt: new Date(),
    filters: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("应该跳过 etag 未变化的商品", async () => {
    // 测试实现...
  });

  it("应该创建新快照当 etag 变化时", async () => {
    // 测试实现...
  });

  it("应该检测价格变化", async () => {
    // 测试实现...
  });
});
```

**运行测试:**
```bash
npm run test
npm run test -- --coverage  # 查看覆盖率
```

---

#### 步骤 5.2: 添加 API 集成测试
**目标:** 测试 API 路由的完整流程

**创建 app/api/__tests__/ 目录:**
```
app/api/__tests__/
├── items.test.ts
├── crawl.test.ts
└── auth.test.ts
```

**示例测试:**
```typescript
// app/api/__tests__/items.test.ts
import { describe, it, expect } from "vitest";
import { POST } from "../items/route";

describe("POST /api/items", () => {
  it("应该拒绝未认证的请求", async () => {
    const request = new Request("http://localhost/api/items", {
      method: "POST",
      body: JSON.stringify({ value: "465167" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("应该验证输入数据", async () => {
    // 测试实现...
  });
});
```

---

#### 步骤 5.3: 完善项目文档
**目标:** 更新和完善所有文档

**需要更新的文档:**

**1. README.md - 添加更多细节**
```markdown
# UniTrack

> 一个标准、规范的 Next.js 15 全栈应用示例项目

## 项目特点

- ✅ Next.js 15 App Router 最佳实践
- ✅ TypeScript 严格模式
- ✅ Prisma ORM 数据库管理
- ✅ NextAuth 认证系统
- ✅ Tailwind CSS + shadcn/ui
- ✅ Zod 数据验证
- ✅ Vitest 单元测试
- ✅ 完整的错误处理
- ✅ 速率限制保护
- ✅ 类型安全的 API

## 学习路径

### 1. 基础概念
- Next.js App Router 路由系统
- 服务器组件 vs 客户端组件
- Server Actions 和 API Routes

### 2. 数据管理
- Prisma Schema 设计
- 数据库迁移和种子
- 查询优化和关系处理

### 3. 认证授权
- NextAuth 配置
- Session 管理
- 路由保护

### 4. 表单处理
- React Hook Form 集成
- Zod 验证
- 错误处理

### 5. 性能优化
- 图片优化
- 代码分割
- 缓存策略

## 项目结构详解

```
unitrack/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 认证路由组
│   ├── (dashboard)/         # 控制台路由组
│   ├── api/                 # API 路由
│   │   ├── auth/           # 认证 API
│   │   ├── items/          # 商品管理 API
│   │   └── crawl/          # 爬虫 API
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── loading.tsx         # 全局加载
│   └── error.tsx           # 全局错误
├── components/              # React 组件
│   ├── ui/                 # UI 基础组件
│   ├── landing/            # 首页组件
│   └── forms/              # 表单组件
├── lib/                     # 业务逻辑
│   ├── auth.ts             # 认证配置
│   ├── db.ts               # 数据库客户端
│   ├── crawl.ts            # 爬虫逻辑
│   ├── scraper.ts          # 数据抓取
│   ├── diff.ts             # 快照对比
│   ├── notify.ts           # 通知系统
│   ├── validators.ts       # 数据验证
│   ├── constants.ts        # 常量配置
│   ├── errors.ts           # 错误处理
│   └── api-response.ts     # API 响应
├── types/                   # TypeScript 类型
│   ├── api.ts              # API 类型
│   ├── database.ts         # 数据库类型
│   └── components.ts       # 组件类型
├── prisma/                  # 数据库
│   ├── schema.prisma       # 数据模型
│   ├── migrations/         # 迁移文件
│   └── seed.ts             # 种子数据
└── hooks/                   # 自定义 Hooks
    └── use-toast.ts        # Toast 通知
```

## 开发指南

### 添加新功能的步骤

1. **定义数据模型** (prisma/schema.prisma)
2. **创建数据库迁移** (`npm run db:push`)
3. **定义类型** (types/)
4. **实现业务逻辑** (lib/)
5. **创建 API 路由** (app/api/)
6. **构建 UI 组件** (components/)
7. **添加页面** (app/)
8. **编写测试** (__tests__/)

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用 PascalCase
- 函数使用 camelCase
- 常量使用 UPPER_SNAKE_CASE
- 文件名使用 kebab-case

## 部署

### Vercel 部署

```bash
# 1. 推送到 GitHub
git push origin main

# 2. 在 Vercel 导入项目
# 3. 配置环境变量
# 4. 部署
```

### 环境变量配置

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
RESEND_API_KEY=...  # 可选
UPSTASH_REDIS_REST_URL=...  # 可选
UPSTASH_REDIS_REST_TOKEN=...  # 可选
```

## 常见问题

### Q: 如何切换数据库？
A: 修改 `prisma/schema.prisma` 中的 `provider`，然后运行 `npm run db:push`

### Q: 如何添加新的 UI 组件？
A: 使用 shadcn/ui CLI: `npx shadcn@latest add [component-name]`

### Q: 如何调试 API 路由？
A: 在 API 路由中添加 `console.log`，查看终端输出

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License
```

**2. CLAUDE.md - 更新重构后的信息**
```markdown
# CLAUDE.md

此文件为 Claude Code 提供项目指导。

## 项目概述

UniTrack 是一个标准的 Next.js 15 全栈应用，用于追踪优衣库商品价格变化。

## 重构完成情况

✅ 删除了 30+ 个未使用的 UI 组件
✅ 合并了重复的表单组件
✅ 拆分了首页组件
✅ 添加了 Loading 和 Error 边界
✅ 提取了常量配置
✅ 完善了类型定义
✅ 统一了错误处理
✅ 添加了代码注释
✅ 实现了通知系统
✅ 优化了数据库查询
✅ 增强了密码安全
✅ 添加了速率限制
✅ 完善了测试覆盖

## 开发命令

```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run test         # 运行测试
npm run db:push      # 同步数据库
npm run db:seed      # 种子数据
npm run db:studio    # Prisma Studio
```

## 架构说明

### 数据流

1. 用户添加追踪商品 → API 验证 → 存入数据库
2. 定时任务触发爬虫 → 抓取数据 → 对比快照
3. 检测到变化 → 创建事件 → 发送通知

### 关键模块

- **认证**: NextAuth + JWT
- **数据库**: Prisma + PostgreSQL
- **验证**: Zod schemas
- **通知**: Resend (邮件)
- **速率限制**: Upstash Redis

## 注意事项

- 所有 API 路由都需要认证检查
- 使用统一的错误响应格式
- 数据库查询要考虑性能
- 敏感操作要添加速率限制
```

**3. 创建 CONTRIBUTING.md**
```markdown
# 贡献指南

感谢你对 UniTrack 项目的关注！

## 开发环境设置

1. Fork 并克隆仓库
2. 安装依赖: `npm install`
3. 配置环境变量: 复制 `.env.example` 到 `.env`
4. 初始化数据库: `npm run db:push && npm run db:seed`
5. 启动开发服务器: `npm run dev`

## 提交规范

使用 Conventional Commits 格式:

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

示例: `feat: 添加商品价格历史图表`

## Pull Request 流程

1. 创建特性分支
2. 编写代码和测试
3. 确保测试通过: `npm run test`
4. 提交 PR，描述清楚改动内容
5. 等待 Code Review

## 代码审查标准

- ✅ 代码符合项目规范
- ✅ 有适当的类型定义
- ✅ 有必要的注释
- ✅ 测试覆盖关键逻辑
- ✅ 无明显性能问题
```

---

#### 步骤 5.4: 创建开发者指南
**目标:** 为学生提供详细的学习指南

**创建 docs/ 目录:**
```
docs/
├── 01-getting-started.md      # 入门指南
├── 02-architecture.md         # 架构说明
├── 03-database.md             # 数据库设计
├── 04-authentication.md       # 认证系统
├── 05-api-routes.md           # API 路由
├── 06-components.md           # 组件开发
├── 07-testing.md              # 测试指南
└── 08-deployment.md           # 部署指南
```

**示例文档 - docs/02-architecture.md:**
```markdown
# 架构说明

## 整体架构

UniTrack 采用经典的三层架构:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│    (Next.js Pages & Components)     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Business Logic Layer        │
│         (lib/ directory)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Data Access Layer          │
│        (Prisma ORM + Database)      │
└─────────────────────────────────────┘
```

## 核心模块

### 1. 认证模块 (lib/auth.ts)

负责用户认证和会话管理。

**关键概念:**
- NextAuth 配置
- Credentials Provider
- JWT Session Strategy
- 密码哈希 (bcrypt)

**使用示例:**
```typescript
import { auth } from "@/lib/auth";

// 在服务器组件中
const session = await auth();

// 在 API 路由中
export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
}
```

### 2. 爬虫模块 (lib/crawl.ts)

核心业务逻辑，负责抓取和处理商品数据。

**工作流程:**
1. 获取最新快照
2. 抓取新数据
3. 比较 etag
4. 创建新快照
5. 检测变化
6. 创建事件和通知

**关键函数:**
- `crawlTrackedItem()` - 抓取单个商品
- `getLatestSnapshot()` - 获取最新快照

### 3. 数据抓取模块 (lib/scraper.ts)

负责从 UNIQLO API 获取商品数据。

**特性:**
- 支持真实 API 和 Mock 数据
- 自动生成 etag
- 价格以分为单位存储
- 错误处理和重试

### 4. 差异检测模块 (lib/diff.ts)

比较两个快照的差异。

**监控字段:**
- title (标题)
- priceCent (价格)
- listPriceCent (原价)
- inStock (库存状态)

**返回类型:**
- `created` - 新商品
- `updated` - 有变化
- `none` - 无变化

## 数据流详解

### 添加商品流程

```
用户输入 URL/商品编码
    ↓
客户端 Zod 验证
    ↓
POST /api/items
    ↓
服务端验证 + 认证检查
    ↓
解析商品编码
    ↓
检查是否已追踪
    ↓
创建 TrackedItem
    ↓
返回成功响应
```

### 爬虫流程

```
触发爬虫 (手动/定时)
    ↓
获取所有 TrackedItem
    ↓
遍历每个商品
    ↓
fetchProduct() 抓取数据
    ↓
比较 etag
    ↓
etag 相同? → 跳过
    ↓
创建新 ProductSnapshot
    ↓
diffSnapshots() 对比
    ↓
有变化? → 创建 ChangeEvent
    ↓
创建 Notification
    ↓
notify() 发送通知
```

## 设计模式

### 1. Repository Pattern

Prisma 作为数据访问层，封装所有数据库操作。

### 2. Service Layer

lib/ 目录中的模块作为服务层，处理业务逻辑。

### 3. DTO Pattern

使用 Zod schemas 定义数据传输对象。

### 4. Error Handling Pattern

统一的错误处理和响应格式。

## 性能优化

### 1. 数据库查询优化
- 使用 `include` 预加载关联数据
- 添加适当的索引
- 限制查询数量

### 2. 缓存策略
- Next.js 自动缓存
- Prisma 查询缓存
- Redis 缓存 (可选)

### 3. 并发控制
- 批量处理爬虫任务
- 控制并发数量
- 添加延迟避免限流

## 安全考虑

### 1. 认证授权
- 所有敏感 API 需要认证
- 用户只能访问自己的数据

### 2. 输入验证
- 客户端 + 服务端双重验证
- 使用 Zod 定义严格的 schema

### 3. 速率限制
- 防止 API 滥用
- 使用 Redis 实现分布式限流

### 4. 错误处理
- 不泄露敏感信息
- 统一的错误响应格式
- 详细的服务端日志

## 扩展性

### 水平扩展
- 无状态 API 设计
- 使用外部 Redis
- 数据库读写分离

### 功能扩展
- 插件化的通知系统
- 可配置的爬虫策略
- 多平台支持

## 学习建议

1. 先理解整体架构
2. 从数据模型开始学习
3. 跟踪一个完整的数据流
4. 阅读关键模块的代码
5. 尝试添加新功能
```

---

## 六、验证清单

### 代码清理验证
- [ ] 删除所有未使用的 UI 组件
- [ ] 删除 mobile-nav.tsx
- [ ] 合并表单组件
- [ ] 拆分首页组件
- [ ] 移除未使用的依赖

### 代码规范验证
- [ ] 所有常量已提取到 constants.ts
- [ ] 所有类型定义完整
- [ ] 错误处理统一
- [ ] 代码注释完善
- [ ] 命名规范一致

### 功能完善验证
- [ ] 通知系统可用
- [ ] 数据库查询优化
- [ ] 密码安全增强
- [ ] 速率限制生效
- [ ] Loading 和 Error 边界正常

### 测试验证
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 测试覆盖率 > 70%

### 文档验证
- [ ] README.md 更新
- [ ] CLAUDE.md 更新
- [ ] CONTRIBUTING.md 创建
- [ ] docs/ 目录完整

---

## 七、预期成果

### 代码质量提升
- **代码行数减少**: 约 5000+ 行未使用代码被删除
- **文件数量减少**: 30+ 个未使用组件被移除
- **可读性提升**: 组件拆分、注释完善
- **维护性提升**: 统一规范、清晰架构

### 功能完善
- ✅ 通知系统实现
- ✅ 速率限制保护
- ✅ 密码安全增强
- ✅ 查询性能优化
- ✅ 错误处理完善

### 教学价值
- ✅ 符合 Next.js 15 最佳实践
- ✅ 完整的项目结构示例
- ✅ 详细的代码注释
- ✅ 丰富的文档说明
- ✅ 清晰的学习路径

### 性能指标
- **包体积**: 减少约 30%
- **构建时间**: 减少约 20%
- **首屏加载**: 优化 15%
- **API 响应**: 优化 25%

---

## 八、实施时间表

### 第 1 周: 代码清理
- Day 1-2: 删除未使用组件
- Day 3-4: 合并表单组件
- Day 5: 拆分首页组件

### 第 2 周: 代码规范化
- Day 1: 提取常量
- Day 2-3: 完善类型定义
- Day 4: 统一错误处理
- Day 5: 添加注释

### 第 3 周: 功能完善
- Day 1-2: 实现通知系统
- Day 3: 优化数据库查询
- Day 4: 增强安全性
- Day 5: 添加速率限制

### 第 4 周: 测试和文档
- Day 1-2: 编写单元测试
- Day 3: 编写集成测试
- Day 4-5: 完善文档

---

## 九、风险和注意事项

### 风险识别
1. **数据迁移风险**: 数据库 schema 变更可能影响现有数据
2. **功能回归风险**: 重构可能引入新 bug
3. **依赖冲突风险**: 更新依赖可能导致兼容性问题

### 缓解措施
1. **备份数据**: 重构前完整备份数据库
2. **分支开发**: 在独立分支进行重构
3. **充分测试**: 每个阶段完成后进行测试
4. **渐进式重构**: 分阶段进行，避免大规模改动
5. **代码审查**: 重要改动需要 review

### 回滚计划
- 保留原始代码分支
- 记录所有重要变更
- 准备快速回滚脚本

---

## 十、总结

本重构计划旨在将 UniTrack 项目改造为一个**标准、规范、高质量**的 Next.js 教学项目。通过系统性的代码清理、规范化、功能完善和文档补充，使项目成为学习 Next.js 15 全栈开发的优秀范例。

### 核心价值
1. **教学价值**: 完整展示 Next.js 最佳实践
2. **实用价值**: 可直接用于生产环境
3. **参考价值**: 为其他项目提供模板

### 后续维护
- 定期更新依赖
- 跟进 Next.js 新特性
- 持续优化性能
- 收集反馈改进

---

**重构计划制定完成**

总计: 约 1200+ 行详细计划
包含: 10 个主要章节，40+ 个具体步骤
预计工时: 4 周全职开发


**3. 创建 CONTRIBUTING.md**
```markdown
# 贡献指南

感谢你对 UniTrack 项目的关注！

## 开发流程

1. **Fork 项目**
2. **克隆到本地**
   ```bash
   git clone https://github.com/your-username/unitrack.git
   cd unitrack
   ```
3. **安装依赖**
   ```bash
   npm install
   ```
4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```
5. **初始化数据库**
   ```bash
   npm run db:push
   npm run db:seed
   ```
6. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 代码规范

- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier
- 编写有意义的提交信息
- 为新功能添加测试
- 更新相关文档

## 提交规范

使用 Conventional Commits 格式：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具链更新
```

## Pull Request 流程

1. 确保所有测试通过
2. 更新相关文档
3. 描述清楚改动内容
4. 等待代码审查
```

**4. 创建 ARCHITECTURE.md**
```markdown
# 架构文档

## 系统架构

### 技术栈
- **前端**: Next.js 15 (App Router) + React 19
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL (Prisma ORM)
- **认证**: NextAuth 5
- **UI**: Tailwind CSS + Radix UI

### 核心模块

#### 1. 认证模块 (lib/auth.ts)
- NextAuth Credentials Provider
- JWT Session 策略
- 密码 bcrypt 加密

#### 2. 爬虫模块 (lib/crawl.ts)
- 定期抓取商品数据
- Etag 优化避免重复
- 快照存储和对比

#### 3. 通知模块 (lib/notify.ts)
- 价格变化通知
- 库存变化通知
- 支持邮件/应用内通知

#### 4. 数据对比模块 (lib/diff.ts)
- 快照字段对比
- 变化类型识别
- 差异数据生成

### 数据流

```
用户添加商品
    ↓
创建 TrackedItem
    ↓
定期触发爬虫
    ↓
fetchProduct (scraper.ts)
    ↓
对比 etag
    ↓
创建 ProductSnapshot
    ↓
diffSnapshots (diff.ts)
    ↓
检测到变化？
    ↓ 是
创建 ChangeEvent
    ↓
创建 Notification
    ↓
发送通知 (notify.ts)
```

### 数据库设计

#### 核心表关系
```
User (用户)
  ↓ 1:N
TrackedItem (追踪商品)
  ↓ 1:N
ProductSnapshot (商品快照)
  ↓ 1:N
ChangeEvent (变化事件)
  ↓ 1:N
Notification (通知)
```

#### 关键索引
- `TrackedItem`: `[userId, productCode]` (唯一)
- `ProductSnapshot`: `[trackedItemId, etag]` (唯一)
- `ProductSnapshot`: `[trackedItemId, fetchedAt]`
- `Notification`: `[userId, status]`

### API 设计

#### RESTful 规范
```
GET    /api/items          # 获取追踪列表
POST   /api/items          # 添加追踪
DELETE /api/items/[id]     # 删除追踪
PATCH  /api/items/[id]     # 更新追踪

POST   /api/crawl/[code]   # 抓取单个商品
POST   /api/crawl/all      # 抓取所有商品
```

#### 响应格式
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: object;
  };
}
```

### 安全措施

1. **认证保护**: 所有敏感 API 需要登录
2. **速率限制**: 防止 API 滥用
3. **输入验证**: Zod schema 验证
4. **SQL 注入防护**: Prisma ORM 参数化查询
5. **XSS 防护**: React 自动转义
6. **CSRF 防护**: NextAuth 内置保护

### 性能优化

1. **数据库查询优化**
   - 使用索引
   - 避免 N+1 查询
   - 批量操作

2. **前端优化**
   - Next.js Image 优化
   - 代码分割
   - 服务器组件减少 JS

3. **缓存策略**
   - Etag 缓存
   - API 响应缓存
   - 静态页面生成

### 扩展性考虑

1. **水平扩展**: 无状态 API 设计
2. **队列系统**: 爬虫任务可迁移到 Bull/BullMQ
3. **微服务**: 爬虫模块可独立部署
4. **CDN**: 静态资源使用 CDN
```

---

#### 步骤 5.4: 添加代码示例和教程
**目标:** 为学生提供学习材料

**创建 docs/ 目录:**
```
docs/
├── tutorials/
│   ├── 01-setup.md
│   ├── 02-database.md
│   ├── 03-authentication.md
│   ├── 04-api-routes.md
│   ├── 05-forms.md
│   └── 06-deployment.md
├── examples/
│   ├── add-new-feature.md
│   ├── custom-hook.md
│   └── api-integration.md
└── best-practices.md
```

**示例教程 - docs/tutorials/04-api-routes.md:**
```markdown
# API Routes 教程

## 创建 API 路由

### 1. 基础 API 路由

在 `app/api/hello/route.ts` 创建：

\`\`\`typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
\`\`\`

访问: `http://localhost:3000/api/hello`

### 2. 带参数的 API 路由

在 `app/api/users/[id]/route.ts` 创建：

\`\`\`typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  
  // 查询用户
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}
\`\`\`

### 3. POST 请求处理

\`\`\`typescript
export async function POST(request: Request) {
  // 解析请求体
  const body = await request.json();
  
  // 验证数据
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  // 处理业务逻辑
  const result = await createItem(parsed.data);

  return NextResponse.json(result, { status: 201 });
}
\`\`\`

### 4. 认证保护

\`\`\`typescript
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 继续处理...
}
\`\`\`

## 最佳实践

1. **统一错误处理**: 使用 `errorResponse` 辅助函数
2. **输入验证**: 始终使用 Zod 验证
3. **类型安全**: 定义清晰的类型
4. **错误日志**: 记录错误便于调试
5. **速率限制**: 保护 API 免受滥用

## 练习

1. 创建一个 `/api/products` 路由
2. 实现 GET、POST、DELETE 方法
3. 添加认证保护
4. 添加输入验证
5. 编写测试
```

---

## 六、验证清单

### 代码清理验证
- [ ] 删除所有未使用的 UI 组件
- [ ] 删除 mobile-nav.tsx
- [ ] 合并重复的表单组件
- [ ] 拆分首页组件
- [ ] 移除未使用的依赖

### 代码规范验证
- [ ] 所有常量提取到 constants.ts
- [ ] 完善 TypeScript 类型定义
- [ ] 统一错误处理格式
- [ ] 添加 JSDoc 注释
- [ ] 统一命名规范

### 功能完善验证
- [ ] 实现通知系统
- [ ] 优化数据库查询
- [ ] 增强密码安全
- [ ] 添加速率限制
- [ ] 添加 Loading 和 Error 边界

### 测试验证
- [ ] 核心业务逻辑单元测试
- [ ] API 路由集成测试
- [ ] 测试覆盖率 > 70%

### 文档验证
- [ ] 更新 README.md
- [ ] 更新 CLAUDE.md
- [ ] 创建 CONTRIBUTING.md
- [ ] 创建 ARCHITECTURE.md
- [ ] 添加教程文档

### 部署验证
- [ ] 本地开发环境正常
- [ ] 生产构建成功
- [ ] 数据库迁移正常
- [ ] 环境变量配置完整
- [ ] Vercel 部署成功

---

## 七、预期成果

### 代码质量提升
- **代码行数减少**: 约 5000+ 行未使用代码被删除
- **文件数量减少**: 约 30+ 个未使用组件被删除
- **包体积减小**: 预计减少 20-30%
- **构建时间缩短**: 预计缩短 15-20%

### 可读性提升
- **组件平均行数**: 从 200+ 行降至 100 行以内
- **函数复杂度**: 降低 30%
- **注释覆盖率**: 提升至 80%+
- **类型安全**: 100% TypeScript 覆盖

### 功能完善
- **通知系统**: 完整实现
- **错误处理**: 统一规范
- **安全性**: 增强密码策略和速率限制
- **性能**: 优化数据库查询

### 教学价值
- **标准规范**: 符合 Next.js 15 最佳实践
- **易于理解**: 清晰的代码结构和注释
- **完整文档**: 详细的教程和示例
- **可扩展性**: 良好的架构设计

---

## 八、实施时间表

### 第 1 周: 代码清理
- Day 1-2: 删除未使用组件
- Day 3-4: 合并重复组件
- Day 5: 拆分首页组件

### 第 2 周: 代码规范化
- Day 1: 提取常量和类型
- Day 2-3: 统一错误处理
- Day 4-5: 添加注释和文档

### 第 3 周: 功能完善
- Day 1-2: 实现通知系统
- Day 3: 优化数据库查询
- Day 4-5: 添加安全措施

### 第 4 周: 测试和文档
- Day 1-3: 编写测试
- Day 4-5: 完善文档

---

## 九、风险和注意事项

### 潜在风险
1. **删除组件可能影响未来功能**: 建议先备份
2. **数据库迁移可能失败**: 先在开发环境测试
3. **API 变更可能影响前端**: 保持向后兼容
4. **性能优化可能引入 bug**: 充分测试

### 注意事项
1. **渐进式重构**: 不要一次性改动过大
2. **保持功能正常**: 每个阶段都要测试
3. **版本控制**: 频繁提交，便于回滚
4. **文档同步**: 代码和文档同步更新

---

## 十、总结

本重构计划旨在将 UniTrack 项目改造成一个**标准、规范、高可读性**的 Next.js 15 教学项目。通过系统性的代码清理、规范化、功能完善和文档编写，使项目成为学习 Next.js 全栈开发的优秀范例。

重构完成后，项目将具备：
- ✅ 清晰的代码结构
- ✅ 完善的类型安全
- ✅ 统一的错误处理
- ✅ 良好的性能优化
- ✅ 完整的测试覆盖
- ✅ 详细的文档说明

这将是一个真正适合教学和学习的 Next.js 项目！
理和文档
- Day 4-5: 添加 Loading/Error 边界

### 第 3 周: 功能完善
- Day 1-2: 实现通知系统
- Day 3: 优化数据库查询
- Day 4: 增强安全性
- Day 5: 添加速率限制

### 第 4 周: 测试和文档
- Day 1-2: 编写单元测试
- Day 3: 编写集成测试
- Day 4-5: 完善文档和教程

### 第 5 周: 验证和部署
- Day 1-2: 全面测试
- Day 3: 修复问题
- Day 4: 部署到生产环境
- Day 5: 最终验证

---

## 九、风险和注意事项

### 潜在风险

#### 1. 删除组件导致的问题
**风险**: 可能误删正在使用的组件
**缓解措施**: 
- 使用 grep 搜索所有引用
- 逐个验证后再删除
- 使用 Git 版本控制，随时可回滚

#### 2. 数据库迁移问题
**风险**: 修改 schema 可能导致数据丢失
**缓解措施**:
- 备份数据库
- 使用 Prisma 迁移而非 db:push
- 在开发环境充分测试

#### 3. 破坏现有功能
**风险**: 重构可能引入新 bug
**缓解措施**:
- 每个步骤后进行测试
- 保持小步快跑
- 及时提交 Git

#### 4. 第三方服务依赖
**风险**: 邮件/Redis 服务配置复杂
**缓解措施**:
- 提供降级方案
- 详细的配置文档
- 使用环境变量控制

### 注意事项

1. **保持向后兼容**: 不要破坏现有 API 接口
2. **渐进式重构**: 不要一次性改动太多
3. **充分测试**: 每个改动都要验证
4. **文档同步**: 代码和文档保持一致
5. **性能监控**: 关注重构后的性能变化

---

## 十、成功标准

### 代码质量标准
- ✅ 无未使用的代码和依赖
- ✅ 所有组件 < 150 行
- ✅ 所有函数 < 50 行
- ✅ TypeScript 严格模式无错误
- ✅ ESLint 无警告

### 功能标准
- ✅ 所有现有功能正常工作
- ✅ 通知系统完整实现
- ✅ 错误处理统一规范
- ✅ 安全措施完善

### 性能标准
- ✅ 首页加载 < 2 秒
- ✅ API 响应 < 500ms
- ✅ 数据库查询优化
- ✅ Lighthouse 分数 > 90

### 测试标准
- ✅ 单元测试覆盖率 > 70%
- ✅ 核心功能有集成测试
- ✅ 所有测试通过
- ✅ 无已知 bug

### 文档标准
- ✅ README 完整详细
- ✅ API 文档清晰
- ✅ 代码注释充分
- ✅ 教程易于理解

---

## 十一、后续优化建议

### 短期优化 (1-2 个月)
1. **添加更多测试**: 提升覆盖率到 90%+
2. **性能监控**: 集成 Sentry 或类似工具
3. **SEO 优化**: 添加 metadata 和 sitemap
4. **国际化**: 支持多语言
5. **移动端优化**: 改进移动端体验

### 中期优化 (3-6 个月)
1. **队列系统**: 使用 Bull/BullMQ 处理爬虫任务
2. **缓存层**: 添加 Redis 缓存
3. **实时通知**: WebSocket 推送
4. **数据分析**: 价格趋势图表
5. **用户偏好**: 个性化设置

### 长期优化 (6-12 个月)
1. **微服务架构**: 拆分爬虫服务
2. **GraphQL API**: 提供更灵活的 API
3. **移动应用**: React Native 版本
4. **AI 推荐**: 智能价格预测
5. **社区功能**: 用户分享和评论

---

## 十二、关键文件清单

### 需要创建的文件

**类型定义:**
- `types/index.ts`
- `types/api.ts`
- `types/database.ts`
- `types/components.ts`

**业务逻辑:**
- `lib/constants.ts`
- `lib/errors.ts`
- `lib/api-response.ts`
- `lib/rate-limit.ts`

**组件:**
- `components/tracked-item-form.tsx`
- `components/landing/hero-section.tsx`
- `components/landing/features-section.tsx`
- `components/landing/how-it-works-section.tsx`
- `components/landing/benefits-section.tsx`
- `components/landing/testimonials-section.tsx`
- `components/landing/faq-section.tsx`
- `components/landing/cta-section.tsx`

**边界组件:**
- `app/loading.tsx`
- `app/error.tsx`
- `app/dashboard/loading.tsx`
- `app/dashboard/error.tsx`
- `app/items/new/loading.tsx`
- `app/items/new/error.tsx`

**测试:**
- `lib/__tests__/crawl.test.ts`
- `lib/__tests__/scraper.test.ts`
- `lib/__tests__/validators.test.ts`
- `lib/__tests__/product-code.test.ts`
- `app/api/__tests__/items.test.ts`
- `app/api/__tests__/crawl.test.ts`

**文档:**
- `CONTRIBUTING.md`
- `ARCHITECTURE.md`
- `docs/tutorials/01-setup.md`
- `docs/tutorials/02-database.md`
- `docs/tutorials/03-authentication.md`
- `docs/tutorials/04-api-routes.md`
- `docs/tutorials/05-forms.md`
- `docs/tutorials/06-deployment.md`
- `docs/best-practices.md`

### 需要删除的文件

**未使用的 UI 组件 (30+ 个):**
```bash
components/ui/sidebar.tsx
components/ui/chart.tsx
components/ui/menubar.tsx
components/ui/context-menu.tsx
components/ui/field.tsx
components/ui/carousel.tsx
components/ui/calendar.tsx
components/ui/item.tsx
components/ui/select.tsx
components/ui/command.tsx
components/ui/navigation-menu.tsx
components/ui/accordion.tsx
components/ui/alert-dialog.tsx
components/ui/aspect-ratio.tsx
components/ui/breadcrumb.tsx
components/ui/button-group.tsx
components/ui/checkbox.tsx
components/ui/collapsible.tsx
components/ui/drawer.tsx
components/ui/empty.tsx
components/ui/form.tsx
components/ui/hover-card.tsx
components/ui/input-otp.tsx
components/ui/kbd.tsx
components/ui/pagination.tsx
components/ui/progress.tsx
components/ui/radio-group.tsx
components/ui/resizable.tsx
components/ui/scroll-area.tsx
components/ui/skeleton.tsx
components/ui/slider.tsx
components/ui/sonner.tsx
components/ui/spinner.tsx
components/ui/switch.tsx
components/ui/table.tsx
components/ui/tabs.tsx
components/ui/toggle-group.tsx
components/ui/use-mobile.tsx
```

**重复组件:**
```bash
components/mobile-nav.tsx
components/add-item-form.tsx
components/forms/new-item-form.tsx
```

**旧的 hero 组件 (合并到 landing):**
```bash
components/hero/
```

### 需要修改的文件

**核心业务逻辑:**
- `lib/crawl.ts` - 添加注释、优化查询
- `lib/scraper.ts` - 提取常量、添加注释
- `lib/diff.ts` - 完善类型定义
- `lib/notify.ts` - 实现通知功能
- `lib/validators.ts` - 增强密码验证
- `lib/auth.ts` - 添加注释

**API 路由:**
- `app/api/items/route.ts` - 统一错误处理
- `app/api/items/[id]/route.ts` - 添加验证
- `app/api/crawl/all/route.ts` - 优化查询
- `app/api/crawl/[productCode]/route.ts` - 添加速率限制
- `app/api/auth/signup/route.ts` - 增强安全性

**页面组件:**
- `app/page.tsx` - 拆分为多个组件
- `app/dashboard/page.tsx` - 优化查询
- `app/layout.tsx` - 添加错误边界

**配置文件:**
- `package.json` - 移除未使用依赖
- `.env.example` - 添加新的环境变量
- `README.md` - 更新文档
- `CLAUDE.md` - 更新项目说明

---

## 十三、总结

这个重构计划旨在将 UniTrack 项目改造成一个**标准、规范、高质量**的 Next.js 15 教学项目。通过系统性的代码清理、组件重构、规范化和功能完善，项目将成为学习 Next.js 全栈开发的优秀范例。

### 核心价值

1. **教学价值**: 展示 Next.js 15 最佳实践
2. **代码质量**: 清晰、简洁、易维护
3. **完整性**: 涵盖认证、数据库、API、UI 等各方面
4. **可扩展性**: 良好的架构设计便于扩展
5. **文档完善**: 详细的教程和示例

### 关键改进

- ✅ 删除 5000+ 行未使用代码
- ✅ 组件平均行数减少 50%
- ✅ 统一错误处理和类型定义
- ✅ 完善安全措施和性能优化
- ✅ 添加完整的测试和文档

### 最终目标

打造一个让学生能够**轻松理解、快速上手、深入学习** Next.js 技术栈的高质量开源项目。

---

**计划制定完成时间**: 2026-04-19
**预计实施周期**: 5 周
**预期代码质量提升**: 80%+
**预期教学价值提升**: 100%+

