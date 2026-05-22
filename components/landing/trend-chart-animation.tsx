"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Check, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendChartAnimation() {
  const [phase, setPhase] = useState<"draw" | "drop" | "success" | "reset">(
    "draw"
  );
  const controls = useAnimation();
  const pathData = "M 20,80 C 60,78 100,82 140,80 L 180,80 L 220,120 L 280,120";

  useEffect(() => {
    let mounted = true;

    async function runSequence() {
      while (mounted) {
        setPhase("draw");
        await controls.start("draw");
        if (!mounted) {
          return;
        }

        setPhase("drop");
        await controls.start("drop");
        if (!mounted) {
          return;
        }

        setPhase("success");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!mounted) {
          return;
        }

        setPhase("reset");
        await controls.start("reset");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    void runSequence();

    return () => {
      mounted = false;
      controls.stop();
    };
  }, [controls]);

  return (
    <div className="relative flex h-full min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-900/30">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="grid h-full w-full grid-cols-6 grid-rows-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <div key={index} className="border-b border-r border-gray-500/30" />
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-[300px] aspect-[2/1]">
        <svg viewBox="0 0 300 150" className="h-full w-full overflow-visible">
          <motion.path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-800"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={cn(
              "stroke-primary transition-colors duration-500",
              phase === "drop" || phase === "success"
                ? "text-primary"
                : "text-gray-400"
            )}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              reset: {
                pathLength: 0,
                opacity: 0,
                transition: { duration: 0 },
              },
              draw: {
                pathLength: 0.6,
                opacity: 1,
                transition: { duration: 1.5, ease: "linear" },
              },
              drop: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.8, ease: "easeOut" },
              },
            }}
            initial="reset"
            animate={controls}
          />
          <motion.circle
            cx="180"
            cy="80"
            r="4"
            className="fill-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "draw" ? 1 : 0 }}
          />
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: phase === "success" ? 1 : 0,
              scale: phase === "success" ? 1 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <circle cx="280" cy="120" r="6" className="fill-primary" />
          </motion.g>
        </svg>

        <motion.div
          className="absolute left-[65%] top-[40%] flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{
            opacity: phase === "drop" || phase === "success" ? 1 : 0,
            y: phase === "drop" || phase === "success" ? 0 : -10,
          }}
          transition={{ delay: 0.1 }}
        >
          <TrendingDown className="h-3 w-3" />
          <span>降价啦!</span>
        </motion.div>

        <motion.div
          className="absolute left-[20%] right-[20%] top-[10%] z-10 flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-xl dark:bg-gray-800"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{
            opacity: phase === "success" ? 1 : 0,
            scale: phase === "success" ? 1 : 0.9,
            y: phase === "success" ? 0 : 10,
          }}
        >
          <div className="rounded-full bg-green-100 p-1.5 dark:bg-green-900/30">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-xs">
            <div className="font-bold">已捕获最优价</div>
            <div className="text-muted-foreground">当前 ¥99 (省 ¥50)</div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 font-mono text-xs text-muted-foreground">
        正在分析价格走势...
      </div>
    </div>
  );
}
