# UniTrack API 文档

本文档以当前项目实现为准，覆盖 `app/api` 下已经存在的接口。

## 基础信息

- Base URL: 开发环境通常为 `http://localhost:3000`
- 认证方式: 基于 NextAuth 会话 Cookie
- 数据格式: 请求与响应均为 `application/json`
- 时间字段: 使用 ISO 8601 字符串
- 金额字段: 统一使用“分”为单位，例如 `9900` 表示 `¥99.00`

## 统一响应格式

### 成功响应

```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 失败响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入数据不合法",
    "details": {}
  }
}
```

## 通用错误码

| 错误码 | 含义 |
| --- | --- |
| `UNAUTHORIZED` | 未登录或会话失效 |
| `FORBIDDEN` | 无权限访问 |
| `NOT_FOUND` | 资源不存在 |
| `VALIDATION_ERROR` | 请求参数校验失败 |
| `CONFLICT` | 资源冲突，例如邮箱已注册 |
| `BAD_REQUEST` | 请求格式错误 |
| `EXTERNAL_API_ERROR` | 外部接口调用失败 |
| `INTERNAL_ERROR` | 服务器内部错误 |

## 认证模块

### `POST /api/auth/signup`

创建新用户账号。

#### 请求体

```json
{
  "email": "demo@unitrack.local",
  "password": "123456",
  "confirmPassword": "123456"
}
```

#### 校验规则

- `email`: 必须为合法邮箱
- `password`: 至少 6 位
- `confirmPassword`: 必须与 `password` 一致

#### 成功响应 `201`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123",
      "email": "demo@unitrack.local"
    }
  },
  "message": "注册成功"
}
```

#### 常见错误

- `409 CONFLICT`: 邮箱已被注册
- `400 VALIDATION_ERROR`: 参数校验失败

### `GET|POST /api/auth/[...nextauth]`

由 NextAuth 接管的认证路由，用于会话、登录、登出等流程。

当前项目主要使用以下能力：

- 凭证登录
- 会话读取
- 登出

项目中的前端登录通常不是直接手写请求该路由，而是通过 `next-auth/react` 的 `signIn` / `signOut` 调用。

## 追踪商品模块

### `GET /api/items`

分页获取当前登录用户的追踪商品列表。

#### 查询参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` | `number` | `1` | 页码，非法值会回退到默认值 |
| `pageSize` | `number` | `20` | 每页数量，最大 `100` |

#### 成功响应 `200`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_1",
        "userId": "user_1",
        "productCode": "465167",
        "url": "https://www.uniqlo.cn/data/products/spu/zh_CN/465167",
        "title": "商品标题",
        "imageUrl": "https://www.uniqlo.cn/hmall/item/465167.jpg",
        "createdAt": "2026-04-20T10:00:00.000Z",
        "filters": {
          "targetPrice": 9900
        },
        "snapshots": [
          {
            "id": "snapshot_1",
            "trackedItemId": "item_1",
            "fetchedAt": "2026-04-20T10:30:00.000Z",
            "priceCent": 9900,
            "listPriceCent": 12900,
            "inStock": true,
            "title": "商品标题",
            "rawJson": {},
            "etag": "etag_value"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  },
  "message": "获取追踪列表成功"
}
```

#### 常见错误

- `401 UNAUTHORIZED`: 未登录

### `POST /api/items`

创建新的追踪商品。

#### 请求体

```json
{
  "value": "465167"
}
```

`value` 支持以下形式：

- UNIQLO 商品详情页链接
- UNIQLO SPU API 链接
- 商品编码，如 `465167`
- API 商品编码，如 `u0000000067280`

#### 成功响应 `201`

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item_1",
      "userId": "user_1",
      "productCode": "465167",
      "url": "https://www.uniqlo.cn/data/products/spu/zh_CN/465167",
      "title": null,
      "imageUrl": null,
      "createdAt": "2026-04-20T10:00:00.000Z",
      "filters": {}
    },
    "status": "created"
  },
  "message": "创建追踪商品成功"
}
```

#### 商品已存在时响应 `200`

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item_1",
      "productCode": "465167"
    },
    "status": "already-tracking"
  },
  "message": "该商品已在追踪列表中"
}
```

#### 常见错误

- `400 VALIDATION_ERROR`: 输入格式不合法
- `401 UNAUTHORIZED`: 未登录

### `DELETE /api/items/:id`

删除当前用户的某个追踪商品。

#### 路径参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 追踪商品 ID |

#### 成功响应 `200`

```json
{
  "success": true,
  "data": {
    "id": "item_1"
  },
  "message": "已停止追踪该商品"
}
```

#### 常见错误

- `401 UNAUTHORIZED`: 未登录
- `404 NOT_FOUND`: 追踪商品不存在

### `PATCH /api/items/:id`

更新追踪商品配置，目前支持目标价格。

#### 路径参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 追踪商品 ID |

#### 请求体

```json
{
  "targetPrice": 8900
}
```

#### 校验规则

- `targetPrice`: 必须是整数，单位为分，且不能小于 `0`

#### 成功响应 `200`

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item_1",
      "filters": {
        "targetPrice": 8900
      }
    }
  },
  "message": "期望价格已更新"
}
```

#### 常见错误

- `400 VALIDATION_ERROR`: 请求体格式不合法
- `401 UNAUTHORIZED`: 未登录
- `404 NOT_FOUND`: 追踪商品不存在

## 抓取模块

### `POST /api/crawl/all`

手动抓取当前登录用户的全部追踪商品。

#### 请求体

无

#### 成功响应 `200`

```json
{
  "success": true,
  "data": {
    "total": 2,
    "created": 1,
    "skipped": 1,
    "results": [
      {
        "trackedItemId": "item_1",
        "productCode": "465167",
        "skipped": false,
        "reason": null,
        "snapshotId": "snapshot_1",
        "changeEventId": "change_1",
        "notificationId": "notification_1"
      },
      {
        "trackedItemId": "item_2",
        "productCode": "465168",
        "skipped": true,
        "reason": "etag-unchanged",
        "snapshotId": null,
        "changeEventId": null,
        "notificationId": null
      }
    ]
  },
  "message": "批量抓取完成"
}
```

#### 结果字段说明

| 字段 | 说明 |
| --- | --- |
| `total` | 本次处理的商品总数 |
| `created` | 产生新快照的数量 |
| `skipped` | 跳过数量 |
| `reason` | 跳过原因，例如 `etag-unchanged` |

#### 常见错误

- `401 UNAUTHORIZED`: 未登录
- `502 EXTERNAL_API_ERROR`: 外部抓取失败

### `POST /api/crawl/:productCode`

手动抓取当前登录用户的单个商品编码。

#### 路径参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `productCode` | `string` | 商品编码或 API 商品编码 |

#### 成功响应 `200`

```json
{
  "success": true,
  "data": {
    "productCode": "465167",
    "results": [
      {
        "trackedItemId": "item_1",
        "skipped": false,
        "reason": null,
        "snapshotId": "snapshot_1",
        "changeEventId": "change_1",
        "notificationId": "notification_1"
      }
    ]
  },
  "message": "单商品抓取完成"
}
```

#### 常见错误

- `401 UNAUTHORIZED`: 未登录
- `404 NOT_FOUND`: 当前用户没有追踪该商品
- `502 EXTERNAL_API_ERROR`: 外部抓取失败

## 备注

- 当前通知实现为应用内通知，抓取成功且检测到变化后会创建通知并立即标记为已发送。
- `filters.targetPrice` 为可选字段，若未设置则不会出现在前端配置中。
- 抓取接口属于高权限操作，建议仅在登录状态下由控制台触发。
