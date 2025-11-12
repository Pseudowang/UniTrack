"use client";

import Image from "next/image";
import { useState, FormEvent, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackedItemPayloadSchema } from "@/lib/validators";
import { buildProductImageUrl, parseProductCode } from "@/lib/product-code";

export function NewItemForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    productCode: string;
    imageUrl?: string;
  } | null>(null);

  const updatePreview = (nextValue: string) => {
    try {
      const parsed = parseProductCode(nextValue);
      setPreview({
        productCode: parsed.productCode,
        imageUrl: buildProductImageUrl(parsed.productCode),
      });
    } catch {
      setPreview(null);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    updatePreview(nextValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const parsed = trackedItemPayloadSchema.safeParse({ value });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "输入不合法");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          (json as { error?: string } | null)?.error ?? "添加失败，请稍后再试"
        );
        return;
      }

      if (json && typeof json === "object" && "message" in json) {
        if (json.message === "already-tracking") {
          setMessage("该商品已在追踪列表中");
        } else {
          setMessage("追踪商品创建成功");
        }
      } else {
        setMessage("追踪商品创建成功");
      }

      setValue("");
      updatePreview("");
      router.refresh();
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="value">UNIQLO 链接或 productCode / API ID</Label>
        <Input
          id="value"
          placeholder="https://www.uniqlo.cn/data/products/spu/zh_CN/u0000000065241.json"
          value={value}
          onChange={handleChange}
          required
        />
      </div>
      {preview ? (
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
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "添加中..." : "添加追踪"}
      </Button>
    </form>
  );
}
