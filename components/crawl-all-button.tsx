"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function CrawlAllButton() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/crawl/all", { method: "POST" });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          (json as { error?: string } | null)?.error ?? "触发失败，请稍后再试"
        );
        return;
      }

      if (json && typeof json === "object" && "created" in json) {
        setMessage(`完成抓取：${json.created} 条更新，跳过 ${json.skipped} 条。`);
      } else {
        setMessage("抓取已完成");
      }
    });
  };

  return (
    <div className="grid gap-2">
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "抓取中..." : "手动触发全量抓取"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </div>
  );
}
