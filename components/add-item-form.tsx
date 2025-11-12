"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import { useToast } from "@/hooks/use-toast";
import { trackedItemPayloadSchema } from "@/lib/validators";

export function AddItemForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValue = value.trim();
    const parsed = trackedItemPayloadSchema.safeParse({ value: trimmedValue });
    if (!parsed.success) {
      toast({
        title: "无效输入",
        description: parsed.error.errors[0]?.message ?? "请输入合法的链接或商品编码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "已添加",
          description:
            data.message === "already-tracking"
              ? "该商品已经在追踪列表"
              : "成功开始追踪，稍后即可看到最新数据",
        });
        setValue("");
        router.refresh();
        return;
      }

      toast({
        title: "添加失败",
        description: data?.error ?? "请稍后再试",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "网络错误",
        description: "无法提交请求，请检查网络后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
      <InputGroup className="flex-1">
        <Input
          placeholder="https://www.uniqlo.cn/... 或商品编码"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isLoading}
        />
      </InputGroup>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "添加中..." : "添加商品"}
      </Button>
    </form>
  );
}
