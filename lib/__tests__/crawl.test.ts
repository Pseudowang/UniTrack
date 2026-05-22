import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../errors";

const {
  prismaMock,
  fetchProductMock,
  diffSnapshotsMock,
  notifyMock,
} = vi.hoisted(() => ({
  prismaMock: {
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
      findUnique: vi.fn(),
    },
  },
  fetchProductMock: vi.fn(),
  diffSnapshotsMock: vi.fn(),
  notifyMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/scraper", () => ({
  fetchProduct: fetchProductMock,
}));

vi.mock("@/lib/diff", () => ({
  diffSnapshots: diffSnapshotsMock,
}));

vi.mock("@/lib/notify", () => ({
  notify: notifyMock,
}));

import { crawlTrackedItem } from "@/lib/crawl";

describe("crawlTrackedItem", () => {
  const trackedItem = {
    id: "item-1",
    userId: "user-1",
    productCode: "u0000000067280",
    url: "https://www.uniqlo.cn/data/products/spu/zh_CN/u0000000067280.json",
    title: null,
    imageUrl: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    filters: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips when etag is unchanged", async () => {
    prismaMock.productSnapshot.findFirst.mockResolvedValue({ etag: "same-etag" });
    fetchProductMock.mockResolvedValue({
      etag: "same-etag",
      title: "商品 A",
      priceCent: 9900,
      listPriceCent: 12900,
      inStock: true,
      imageUrl: "https://example.com/image.jpg",
      raw: {},
      skus: [],
    });

    const result = await crawlTrackedItem(trackedItem);

    expect(result.skipped).toBe(true);
    expect(result.reason).toBe("etag-unchanged");
    expect(prismaMock.productSnapshot.upsert).not.toHaveBeenCalled();
  });

  it("creates snapshot, change event and notification when product changes", async () => {
    prismaMock.productSnapshot.findFirst.mockResolvedValue(null);
    fetchProductMock.mockResolvedValue({
      etag: "new-etag",
      title: "商品 A",
      priceCent: 9900,
      listPriceCent: 12900,
      inStock: true,
      imageUrl: "https://example.com/image.jpg",
      raw: {},
      skus: [],
    });
    prismaMock.productSnapshot.upsert.mockResolvedValue({ id: "snapshot-1" });
    prismaMock.trackedItem.update.mockResolvedValue(undefined);
    diffSnapshotsMock.mockReturnValue({
      changed: true,
      changeType: "updated",
      diff: {
        priceCent: {
          previous: 12900,
          current: 9900,
        },
      },
    });
    prismaMock.changeEvent.create.mockResolvedValue({ id: "change-1" });
    prismaMock.notification.create.mockResolvedValue({ id: "notification-1" });
    prismaMock.notification.findUnique.mockResolvedValue({
      id: "notification-1",
      status: "sent",
    });

    const result = await crawlTrackedItem(trackedItem);

    expect(result.skipped).toBe(false);
    expect(result.snapshot?.id).toBe("snapshot-1");
    expect(result.changeEvent?.id).toBe("change-1");
    expect(result.notification?.status).toBe("sent");
    expect(notifyMock).toHaveBeenCalledWith({ id: "notification-1" });
  });

  it("wraps unexpected errors as AppError", async () => {
    prismaMock.productSnapshot.findFirst.mockResolvedValue(null);
    fetchProductMock.mockRejectedValue(new Error("boom"));

    await expect(crawlTrackedItem(trackedItem)).rejects.toBeInstanceOf(AppError);
  });
});
