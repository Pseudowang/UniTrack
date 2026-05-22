import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    trackedItem: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  authMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: prismaMock,
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

import { GET, POST } from "./route";

describe("/api/items route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized for anonymous users", async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/items"));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("returns paginated tracked items", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findMany.mockResolvedValue([
      { id: "item-2", productCode: "465168", snapshots: [] },
    ]);
    prismaMock.trackedItem.count.mockResolvedValue(25);

    const response = await GET(
      new Request("http://localhost/api/items?page=2&pageSize=10")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.page).toBe(2);
    expect(payload.data.pageSize).toBe(10);
    expect(payload.data.hasMore).toBe(true);
    expect(prismaMock.trackedItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it("creates a new tracked item", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findUnique.mockResolvedValue(null);
    prismaMock.trackedItem.create.mockResolvedValue({
      id: "item-1",
      productCode: "465167",
    });

    const response = await POST(
      new Request("http://localhost/api/items", {
        method: "POST",
        body: JSON.stringify({ value: "465167" }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.success).toBe(true);
    expect(payload.data.status).toBe("created");
    expect(prismaMock.trackedItem.create).toHaveBeenCalled();
  });

  it("returns already tracked when the item exists", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findUnique.mockResolvedValue({
      id: "item-1",
      productCode: "465167",
    });

    const response = await POST(
      new Request("http://localhost/api/items", {
        method: "POST",
        body: JSON.stringify({ value: "465167" }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.status).toBe("already-tracking");
    expect(payload.message).toBe("该商品已在追踪列表中");
  });
});
