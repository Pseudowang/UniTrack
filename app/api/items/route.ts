import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { PAGINATION_CONFIG } from "@/lib/constants";
import { successResponse, handleRouteError } from "@/lib/api-response";
import { AppError, ErrorCode } from "@/lib/errors";
import { trackedItemPayloadSchema } from "@/lib/validators";
import { parseProductCode } from "@/lib/product-code";
import { UNIQLO_SPU_API_BASE } from "@/lib/scraper";

/**
 * 解析分页参数，非法值回退到默认值。
 */
function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

/**
 * 分页获取当前登录用户的追踪商品列表。
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(
      searchParams.get("page"),
      PAGINATION_CONFIG.DEFAULT_PAGE
    );
    const requestedPageSize = parsePositiveInt(
      searchParams.get("pageSize"),
      PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
    );
    const pageSize = Math.min(
      requestedPageSize,
      PAGINATION_CONFIG.MAX_PAGE_SIZE
    );

    const where = { userId: session.user.id };
    const [items, total] = await Promise.all([
      prisma.trackedItem.findMany({
        where,
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
      prisma.trackedItem.count({ where }),
    ]);

    return successResponse(
      {
        items,
        total,
        page,
        pageSize,
        hasMore: page * pageSize < total,
      },
      "获取追踪列表成功"
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * 创建新的追踪商品，已存在时返回已追踪状态。
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const json = await request.json().catch(() => null);
    const parsed = trackedItemPayloadSchema.parse(json);
    const result = parseProductCode(parsed.value);

    const normalizedUrl = result.isUrl
      ? parsed.value.trim()
      : result.kind === "api"
      ? `${UNIQLO_SPU_API_BASE}/${result.productCode.toLowerCase()}.json`
      : `https://www.uniqlo.cn/data/products/spu/zh_CN/${result.productCode}`;

    const existing = await prisma.trackedItem.findUnique({
      where: {
        userId_productCode: {
          userId: session.user.id,
          productCode: result.productCode,
        },
      },
    });

    if (existing) {
      return successResponse(
        {
          item: existing,
          status: "already-tracking" as const,
        },
        "该商品已在追踪列表中",
        200
      );
    }

    const item = await prisma.trackedItem.create({
      data: {
        userId: session.user.id,
        productCode: result.productCode,
        url: normalizedUrl,
        filters: {},
      },
    });

    return successResponse(
      {
        item,
        status: "created" as const,
      },
      "创建追踪商品成功",
      201
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
