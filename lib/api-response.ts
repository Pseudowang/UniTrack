import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiResponse } from "@/types";
import { AppError, ErrorCode, isAppError } from "@/lib/errors";

/**
 * 构建统一的成功响应。
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * 构建统一的错误响应。
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status = 400,
  details?: Record<string, unknown>
) {
  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * 将运行时错误转换为标准 API 响应，供路由统一复用。
 */
export function handleRouteError(error: unknown) {
  if (isAppError(error)) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      ErrorCode.VALIDATION_ERROR,
      error.errors[0]?.message ?? "输入数据不合法",
      400,
      {
        issues: error.flatten(),
      }
    );
  }

  console.error(error);

  return errorResponse(
    ErrorCode.INTERNAL_ERROR,
    "服务器内部错误，请稍后重试",
    500
  );
}
