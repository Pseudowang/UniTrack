"use client";

import { ErrorState } from "@/components/error-state";

export default function NewItemError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      title="添加页面加载失败"
      description="无法初始化商品追踪表单，请刷新后重试。"
    />
  );
}
