import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { crawlTrackedItem } from "@/lib/crawl";
import { auth } from "@/lib/auth";
import { successResponse, handleRouteError } from "@/lib/api-response";
import { AppError, ErrorCode } from "@/lib/errors";

/**
 * 手动抓取当前用户的单个商品编码。
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ productCode: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const { productCode } = await params;
    const trackedItems = await prisma.trackedItem.findMany({
      where: {
        userId: session.user.id,
        productCode,
      },
    });

    if (trackedItems.length === 0) {
      throw new AppError(ErrorCode.NOT_FOUND, "未找到对应的追踪商品", 404);
    }

    const results = [];
    for (const item of trackedItems) {
      const result = await crawlTrackedItem(item);
      results.push({
        trackedItemId: item.id,
        skipped: result.skipped,
        reason: result.reason,
        snapshotId: result.snapshot?.id,
        changeEventId: result.changeEvent?.id,
        notificationId: result.notification?.id,
      });
    }

    return successResponse(
      {
        productCode,
        results,
      },
      "单商品抓取完成"
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
