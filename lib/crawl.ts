import {
  Prisma,
  type ChangeEvent,
  type Notification,
  type ProductSnapshot,
  type TrackedItem,
} from "@prisma/client";
import prisma from "./db";
import { AppError, ErrorCode } from "./errors";
import { fetchProduct } from "./scraper";
import { diffSnapshots } from "./diff";
import { notify } from "./notify";

export interface CrawlResult {
  trackedItem: TrackedItem;
  snapshot?: ProductSnapshot;
  changeEvent?: ChangeEvent;
  notification?: Notification;
  skipped: boolean;
  reason?: string;
}

/**
 * 获取某个追踪商品的最新快照。
 */
async function getLatestSnapshot(trackedItemId: string) {
  return prisma.productSnapshot.findFirst({
    where: { trackedItemId },
    orderBy: { fetchedAt: "desc" },
  });
}

/**
 * 判断 Prisma 错误是否为唯一约束冲突。
 */
function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * 抓取并持久化单个追踪商品的最新状态。
 * 如果 etag 未变化，则直接跳过；
 * 如果检测到变化，则创建变更事件和通知记录。
 */
export async function crawlTrackedItem(
  trackedItem: TrackedItem
): Promise<CrawlResult> {
  try {
    const latestSnapshot = await getLatestSnapshot(trackedItem.id);
    const product = await fetchProduct(trackedItem.productCode);

    if (latestSnapshot?.etag === product.etag) {
      return {
        trackedItem,
        skipped: true,
        reason: "etag-unchanged",
      };
    }

    const snapshot = await prisma.productSnapshot.upsert({
      where: {
        trackedItemId_etag: {
          trackedItemId: trackedItem.id,
          etag: product.etag,
        },
      },
      create: {
        trackedItemId: trackedItem.id,
        title: product.title,
        priceCent: product.priceCent,
        listPriceCent: product.listPriceCent,
        inStock: product.inStock,
        rawJson: product.raw,
        etag: product.etag,
      },
      update: {},
    });

    await prisma.trackedItem.update({
      where: { id: trackedItem.id },
      data: {
        title: product.title ?? trackedItem.title,
        imageUrl: product.imageUrl ?? trackedItem.imageUrl,
      },
    });

    const diffResult = diffSnapshots(latestSnapshot, product);

    if (!diffResult.changed) {
      return {
        trackedItem,
        snapshot,
        skipped: false,
        reason: "no-diff",
      };
    }

    const changeEvent = await prisma.changeEvent.create({
      data: {
        trackedItemId: trackedItem.id,
        snapshotId: snapshot.id,
        changeType: diffResult.changeType,
        diff: diffResult.diff,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        userId: trackedItem.userId,
        changeEventId: changeEvent.id,
        channel: "in_app",
        status: "pending",
        meta: {
          summary: diffResult.diff,
        },
      },
    });

    await notify(notification);

    const deliveredNotification = await prisma.notification.findUnique({
      where: { id: notification.id },
    });

    return {
      trackedItem,
      snapshot,
      changeEvent,
      notification: deliveredNotification ?? notification,
      skipped: false,
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        trackedItem,
        skipped: true,
        reason: "snapshot-already-exists",
      };
    }

    console.error("[crawlTrackedItem] failed", {
      trackedItemId: trackedItem.id,
      productCode: trackedItem.productCode,
      error,
    });

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.EXTERNAL_API_ERROR,
      "抓取商品信息失败",
      502,
      {
        trackedItemId: trackedItem.id,
        productCode: trackedItem.productCode,
      }
    );
  }
}
