import type { ApiResponse } from "@/types";

/**
 * 从统一 API 响应中提取可直接展示给用户的错误消息。
 */
export function getApiErrorMessage(
  payload: ApiResponse<unknown> | null,
  fallback: string
) {
  if (!payload) {
    return fallback;
  }

  return payload.success ? payload.message ?? fallback : payload.error.message;
}
