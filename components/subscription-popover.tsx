"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Check, Loader2, Mail } from "lucide-react";

export function SubscriptionPopover() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSuccess(true);
    setEmail("");

    // Auto close after showing success for a briefly longer time
    setTimeout(() => {
      setOpen(false);
      // Reset state after closing
      setTimeout(() => setIsSuccess(false), 300);
    }, 2000);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="gap-2">
           <Mail className="h-4 w-4" />
           Sub
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border/50">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                 <Bell className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-semibold">订阅更新</h4>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
             第一时间获取降价提醒和最新优惠信息。
           </p>
        </div>
        
        <div className="p-6">
            {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-4 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                        <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium text-sm">订阅成功!</h3>
                    <p className="text-xs text-muted-foreground mt-1">感谢您的关注。</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="sr-only">Email</Label>
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} size="sm">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            提交中...
                        </>
                    ) : (
                        "立即订阅"
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    我们承诺不会发送垃圾邮件。
                  </p>
                </form>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
