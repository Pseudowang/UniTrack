"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-client";
import type { ApiResponse } from "@/types";

export function CrawlAllButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCrawlAll = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/crawl/all", {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as ApiResponse<{
        total: number;
        created: number;
        skipped: number;
      }> | null;

      if (!response.ok) {
        toast({
          title: "触发失败",
          description: getApiErrorMessage(data, "系统忙，请稍后再试"),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "抓取完成",
        description:
          data?.success
            ? `共处理 ${data.data.total} 条，生成 ${data.data.created} 条新快照，跳过 ${data.data.skipped} 条。`
            : "批量抓取已完成。",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "网络错误",
        description: "无法触发抓取，请检查网络后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCrawlAll} disabled={isLoading} variant="secondary">
      {isLoading ? "抓取中..." : "立即抓取"}
    </Button>
  );
}
