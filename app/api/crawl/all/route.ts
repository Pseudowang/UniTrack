import prisma from "@/lib/db";
import { crawlTrackedItem } from "@/lib/crawl";
import { auth } from "@/lib/auth";
import { successResponse, handleRouteError } from "@/lib/api-response";
import { CRAWLER_CONFIG } from "@/lib/constants";
import { AppError, ErrorCode } from "@/lib/errors";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getRandomDelay() {
  const { DELAY_MIN_MS, DELAY_MAX_MS } = CRAWLER_CONFIG;
  return DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS);
}

/**
 * 抓取当前用户名下的全部追踪商品。
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const trackedItems = await prisma.trackedItem.findMany({
      where: { userId: session.user.id },
    });

    const results = [];
    for (const item of trackedItems) {
      const crawlResult = await crawlTrackedItem(item);
      results.push({
        trackedItemId: item.id,
        productCode: item.productCode,
        skipped: crawlResult.skipped,
        reason: crawlResult.reason,
        snapshotId: crawlResult.snapshot?.id,
        changeEventId: crawlResult.changeEvent?.id,
        notificationId: crawlResult.notification?.id,
      });

      await sleep(getRandomDelay());
    }

    const created = results.filter((result) => !result.skipped).length;

    return successResponse(
      {
        total: results.length,
        created,
        skipped: results.length - created,
        results,
      },
      "批量抓取完成"
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
