"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DeleteTrackedItemButtonProps {
  itemId: string;
  itemLabel?: string | null;
}

export function DeleteTrackedItemButton({
  itemId,
  itemLabel,
}: DeleteTrackedItemButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    const confirmationMessage = itemLabel
      ? `确定要停止追踪「${itemLabel}」吗？`
      : "确定要停止追踪这个商品吗？";

    if (typeof window !== "undefined" && !window.confirm(confirmationMessage)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "删除失败",
          description: data?.error ?? "请稍后再试",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "已停止追踪",
        description: "该商品已从列表中移除",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "网络错误",
        description: "无法删除，请检查网络后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDelete}
      disabled={isLoading}
      variant="destructive"
      size="sm"
    >
      {isLoading ? "删除中..." : "停止追踪"}
    </Button>
  );
}
