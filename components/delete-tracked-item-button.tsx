"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DeleteTrackedItemButtonProps {
  itemId: string;
  itemLabel?: string | null;
}

export function DeleteTrackedItemButton({
  itemId,
  itemLabel,
}: DeleteTrackedItemButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);

    const confirmMessage = itemLabel
      ? `确定要删除「${itemLabel}」吗？`
      : "确定要删除该追踪商品吗？";

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }
    }

    startTransition(async () => {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          (json as { error?: string } | null)?.error ??
            "删除失败，请稍后重试"
        );
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-1 text-right">
      <Button
        variant="destructive"
        size="sm"
        disabled={pending}
        onClick={handleDelete}
      >
        {pending ? "删除中..." : "删除"}
      </Button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
