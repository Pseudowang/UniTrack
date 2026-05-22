import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("/api/crawl/all route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("rejects anonymous users", async () => {
    authMock.mockResolvedValue(null);

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("crawls only the current user's tracked items", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findMany.mockResolvedValue([
      { id: "item-1", productCode: "465167" },
      { id: "item-2", productCode: "465168" },
    ]);
    crawlTrackedItemMock
      .mockResolvedValueOnce({
        skipped: false,
        snapshot: { id: "snapshot-1" },
        changeEvent: { id: "change-1" },
        notification: { id: "notification-1" },
      })
      .mockResolvedValueOnce({
        skipped: true,
        reason: "etag-unchanged",
      });

    const responsePromise = POST();
    await vi.runAllTimersAsync();
    const response = await responsePromise;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.total).toBe(2);
    expect(payload.data.created).toBe(1);
    expect(prismaMock.trackedItem.findMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
    });
  });
});
