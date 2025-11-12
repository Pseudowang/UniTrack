"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "触发失败",
          description: data?.error ?? "系统忙，请稍后再试",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "抓取完成",
        description: `共处理 ${data.total} 条，生成 ${data.created} 条新快照，跳过 ${data.skipped} 条。`,
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
