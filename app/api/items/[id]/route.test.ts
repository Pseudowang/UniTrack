import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, authMock } = vi.hoisted(() => ({
  prismaMock: {
    trackedItem: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
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

import { DELETE, PATCH } from "./route";

describe("/api/items/[id] route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects delete for anonymous users", async () => {
    authMock.mockResolvedValue(null);

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "item-1" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("UNAUTHORIZED");
  });

  it("deletes an owned tracked item", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findFirst.mockResolvedValue({
      id: "item-1",
      userId: "user-1",
    });
    prismaMock.trackedItem.delete.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "item-1" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.id).toBe("item-1");
  });

  it("updates target price filters", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });
    prismaMock.trackedItem.findFirst.mockResolvedValue({
      id: "item-1",
      userId: "user-1",
      filters: { targetPrice: 9900 },
    });
    prismaMock.trackedItem.update.mockResolvedValue({
      id: "item-1",
      filters: { targetPrice: 8900 },
    });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ targetPrice: 8900 }),
        headers: { "Content-Type": "application/json" },
      }) as never,
      {
        params: Promise.resolve({ id: "item-1" }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(prismaMock.trackedItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          filters: { targetPrice: 8900 },
        },
      })
    );
  });

  it("returns validation errors for invalid target price payloads", async () => {
    authMock.mockResolvedValue({ user: { id: "user-1" } });

    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ targetPrice: "99" }),
        headers: { "Content-Type": "application/json" },
      }) as never,
      {
        params: Promise.resolve({ id: "item-1" }),
      }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
  });
});
