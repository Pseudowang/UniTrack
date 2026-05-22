"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-client";
import { Settings, Loader2 } from "lucide-react";
import type { ApiResponse } from "@/types";

interface TargetPricePopoverProps {
  itemId: string;
  initialTargetPrice?: number | null;
}

export function TargetPricePopover({
  itemId,
  initialTargetPrice,
}: TargetPricePopoverProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Convert cents to yuan for display, default to empty string if null
  const [price, setPrice] = useState(
    initialTargetPrice ? (initialTargetPrice / 100).toString() : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert yuan to cents
      const targetPriceCent = Math.round(parseFloat(price) * 100);

      if (isNaN(targetPriceCent)) {
          throw new Error("请输入有效的价格");
      }

      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetPrice: targetPriceCent,
        }),
      });
      const payload = (await response.json().catch(() => null)) as ApiResponse<{
        item: { id: string };
      }> | null;

      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, "更新失败"));
      }

      toast({
        title: "设置成功",
        description: `期望价格已设置为 ¥${price}`,
      });
      
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "设置失败",
        description: error instanceof Error ? error.message : "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span className="sr-only">设置期望价格</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                 <Settings className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold">期望价格</h4>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             设置您期望的价格，当价格低于此值时，我们将通知您。
           </p>
        </div>
        
        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">目标价格 (元)</Label>
                <Input
                  id="price"
                  placeholder="例如: 99"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} size="sm">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                    </>
                ) : (
                    "保存设置"
                )}
              </Button>
            </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
