import { describe, expect, it } from "vitest";
import { z } from "zod";
import { errorResponse, handleRouteError, successResponse } from "../api-response";
import { AppError, ErrorCode } from "../errors";

describe("api-response helpers", () => {
  it("creates standard success responses", async () => {
    const response = successResponse({ ok: true }, "操作成功", 201);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      success: true,
      data: { ok: true },
      message: "操作成功",
    });
  });

  it("creates standard error responses", async () => {
    const response = errorResponse(ErrorCode.BAD_REQUEST, "参数错误", 400);
    const payload = await response.json();

    expect(payload).toEqual({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "参数错误",
        details: undefined,
      },
    });
  });

  it("maps AppError to route responses", async () => {
    const response = handleRouteError(
      new AppError(ErrorCode.NOT_FOUND, "资源不存在", 404)
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error.code).toBe("NOT_FOUND");
    expect(payload.error.message).toBe("资源不存在");
  });

  it("maps zod errors to validation responses", async () => {
    const schema = z.object({
      name: z.string().min(1, "名称不能为空"),
    });

    const parsed = schema.safeParse({ name: "" });
    if (parsed.success) {
      throw new Error("expected validation failure");
    }

    const response = handleRouteError(parsed.error);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.message).toBe("名称不能为空");
  });
});
