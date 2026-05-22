import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authMock, crawlTrackedItemMock } = vi.hoisted(() => ({
  prismaMock: {
    trackedItem: {
      findMany: vi.fn(),
    },
  },
  authMock: vi.fn(),
  crawlTrackedItemMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/crawl", () => ({
  crawlTrackedItem: crawlTrackedItemMock,
}));

import { POST } from "./route";

describe("/api/crawl/[productCode] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not found when the user does not track the product", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findMany.mockResolvedValue([]);

    const response = await POST(new Request("http://localhost") as never, {
      params: Promise.resolve({ productCode: "465167" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe("NOT_FOUND");
  });

  it("crawls matching tracked items", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findMany.mockResolvedValue([
      { id: "item-1", productCode: "465167" },
    ]);
    crawlTrackedItemMock.mockResolvedValue({
      skipped: false,
      snapshot: { id: "snapshot-1" },
      changeEvent: { id: "change-1" },
      notification: { id: "notification-1" },
    });

    const response = await POST(new Request("http://localhost") as never, {
      params: Promise.resolve({ productCode: "465167" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.productCode).toBe("465167");
    expect(crawlTrackedItemMock).toHaveBeenCalledTimes(1);
  });
});
