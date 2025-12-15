import {
  Prisma,
  type ChangeEvent,
  type Notification,
  type ProductSnapshot,
  type TrackedItem,
} from "@prisma/client";
import prisma from "./db";
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

async function getLatestSnapshot(trackedItemId: string) {
  return prisma.productSnapshot.findFirst({
    where: { trackedItemId },
    orderBy: { fetchedAt: "desc" },
  });
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function crawlTrackedItem(
  trackedItem: TrackedItem
): Promise<CrawlResult> {
  const latestSnapshot = await getLatestSnapshot(trackedItem.id);
  const product = await fetchProduct(trackedItem.productCode);

  if (latestSnapshot?.etag === product.etag) {
    return {
      trackedItem,
      skipped: true,
      reason: "etag-unchanged",
    };
  }

  let snapshot: ProductSnapshot | undefined;

  try {
    snapshot = await prisma.productSnapshot.upsert({
      // 进行 etag 比对，避免重复创建
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
  } catch (error) {
    throw error;
  }

  if (!snapshot) {
    throw new Error("Failed to create product snapshot");
  }

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

  return {
    trackedItem,
    snapshot,
    changeEvent,
    notification,
    skipped: false,
  };
}
