"use client";

import Image from "next/image";
import type React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-client";
import { buildProductImageUrl, parseProductCode } from "@/lib/product-code";
import { trackedItemPayloadSchema } from "@/lib/validators";
import type { ApiResponse } from "@/types";

interface TrackedItemFormProps {
  variant?: "inline" | "full";
  showPreview?: boolean;
  onSuccess?: () => void;
}

type PreviewState = {
  productCode: string;
  imageUrl?: string;
} | null;

export function TrackedItemForm({
  variant = "full",
  showPreview = false,
  onSuccess,
}: TrackedItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>(null);
  const [isPending, startTransition] = useTransition();

  const isInline = variant === "inline";

  function updatePreview(nextValue: string) {
    if (!showPreview) {
      return;
    }

    try {
      const parsed = parseProductCode(nextValue);
      setPreview({
        productCode: parsed.productCode,
        imageUrl: buildProductImageUrl(parsed.productCode),
      });
    } catch {
      setPreview(null);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setValue(nextValue);

    if (!errorMessage && !successMessage) {
      updatePreview(nextValue);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    updatePreview(nextValue);
  }

  function reportError(message: string) {
    if (isInline) {
      toast({
        title: "添加失败",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setErrorMessage(message);
  }

  function reportSuccess(message: string) {
    if (isInline) {
      toast({
        title: "已添加",
        description: message,
      });
      return;
    }

    setSuccessMessage(message);
  }

  function resetForm() {
    setValue("");
    setErrorMessage(null);
    setSuccessMessage(null);
    setPreview(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const parsed = trackedItemPayloadSchema.safeParse({ value: value.trim() });
    if (!parsed.success) {
      reportError(
        parsed.error.errors[0]?.message ?? "请输入合法的链接或商品编码"
      );
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        });

        const json = (await response.json().catch(() => null)) as ApiResponse<{
          item: { id: string };
          status: "created" | "already-tracking";
        }> | null;

        if (!response.ok) {
          reportError(getApiErrorMessage(json, "添加失败，请稍后再试"));
          return;
        }

        const message =
          json?.success && json.data.status === "already-tracking"
            ? "该商品已经在追踪列表中"
            : "成功开始追踪，稍后即可看到最新数据";

        reportSuccess(message);
        resetForm();
        router.refresh();
        onSuccess?.();
      } catch {
        reportError("无法提交请求，请检查网络后重试");
      }
    });
  }

  return (
    <form
      className={isInline ? "flex flex-col gap-3 md:flex-row" : "grid gap-4"}
      onSubmit={handleSubmit}
    >
      <div className={isInline ? "flex-1" : "grid gap-2"}>
        {!isInline ? (
          <Label htmlFor="tracked-item-value">
            UNIQLO 链接或 productCode / API ID
          </Label>
        ) : null}
        <InputGroup className={isInline ? "flex-1" : undefined}>
          <Input
            id="tracked-item-value"
            placeholder={
              isInline
                ? "https://www.uniqlo.cn/... 或商品编码"
                : "/u0000000065241.json"
            }
            value={value}
            onChange={handleChange}
            disabled={isPending}
            required
          />
        </InputGroup>
      </div>

      {showPreview && preview ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="font-medium text-muted-foreground">商品预览</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border bg-background">
              {preview.imageUrl ? (
                <Image
                  src={preview.imageUrl}
                  alt={`预览图 ${preview.productCode}`}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground">暂无图片</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {preview.productCode}
              </p>
              <p className="text-xs text-muted-foreground">
                首页图来自 UNIQLO 官方 CDN。
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!isInline && errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
      {!isInline && successMessage ? (
        <p className="text-sm text-emerald-600">{successMessage}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className={isInline ? "" : "w-full"}>
        {isPending ? "添加中..." : isInline ? "添加商品" : "添加追踪"}
      </Button>
    </form>
  );
}
