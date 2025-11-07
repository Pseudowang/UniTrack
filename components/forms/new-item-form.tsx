"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackedItemPayloadSchema } from "@/lib/validators";

export function NewItemForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "添加中..." : "添加追踪"}
      </Button>
    </form>
  );
}
