"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendChartAnimation() {
  const [phase, setPhase] = useState<"draw" | "drop" | "success" | "reset">("draw");
  const controls = useAnimation();

  // SVG Path Data:
  // Flat start, small fluctuations, then clear drop, then flat again.
  // ViewBox: 0 0 300 150
  const pathData = "M 20,80 C 60,78 100,82 140,80 L 180,80 L 220,120 L 280,120";
  
  // Split path for drop effect? 
  // Maybe simpler: One path that animates drawing.
  // The color change can be handled by a second overlapping path.

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        setPhase("draw");
        // 1. Draw the initial line
        await controls.start("draw");
        
        // 2. Drop Phase
        setPhase("drop");
        await controls.start("drop");
        
        // 3. Success Phase
        setPhase("success");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // 4. Reset
        setPhase("reset");
        await controls.start("reset");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    };

    sequence();
  }, [controls]);

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-center justify-center bg-white/50 dark:bg-gray-900/30 rounded-xl border border-border/50 backdrop-blur-sm overflow-hidden p-6">
      {/* Grid Lines Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full grid grid-cols-6 grid-rows-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="border-r border-b border-gray-500/30" />
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-[300px] aspect-[2/1]">
        <svg viewBox="0 0 300 150" className="w-full h-full overflow-visible">
          {/* Shadow Path */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-800"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Animated Path */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className={cn(
              "stroke-primary transition-colors duration-500",
              phase === "drop" || phase === "success" ? "text-primary" : "text-gray-400"
            )}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              reset: { pathLength: 0, opacity: 0, transition: { duration: 0 } },
              draw: { pathLength: 0.6, opacity: 1, transition: { duration: 1.5, ease: "linear" } }, // Draw up to the drop point
              drop: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }, // Finish drawing (the drop)
            }}
            initial="reset"
            animate={controls}
          />
          
          {/* Drop Point Marker (Where the drop starts) */}
          <motion.circle
             cx="180" cy="80" r="4"
             className="fill-gray-400"
             initial={{ opacity: 0 }}
             animate={{ opacity: phase === 'draw' ? 1 : 0 }}
          />

          {/* End Point Marker */}
          <motion.g
             initial={{ opacity: 0, scale: 0 }}
             animate={{ 
               opacity: phase === 'success' ? 1 : 0,
               scale: phase === 'success' ? 1 : 0
             }}
             transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
             <circle cx="280" cy="120" r="6" className="fill-primary" />
             {/* <circle cx="280" cy="120" r="12" className="stroke-primary fill-none opacity-50 animate-ping" /> */}
          </motion.g>
        </svg>

        {/* Floating Elements */}
        
        {/* Drop Badge */}
        <motion.div
            className="absolute top-[40%] left-[65%] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
                opacity: phase === 'drop' || phase === 'success' ? 1 : 0, 
                y: phase === 'drop' || phase === 'success' ? 0 : -10 
            }}
            transition={{ delay: 0.1 }}
        >
            <TrendingDown className="w-3 h-3" />
            <span>降价啦!</span>
        </motion.div>

        {/* Success Dialog */}
         <motion.div
            className="absolute top-[10%] left-[20%] right-[20%] bg-white dark:bg-gray-800 shadow-xl rounded-lg p-3 border border-border flex items-center gap-3 z-10"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ 
                opacity: phase === 'success' ? 1 : 0, 
                scale: phase === 'success' ? 1 : 0.9,
                y: phase === 'success' ? 0 : 10
            }}
         >
            <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-xs">
                <div className="font-bold">已捕获最优价</div>
                <div className="text-muted-foreground">当前 ¥99 (省 ¥50)</div>
            </div>
        </motion.div>

      </div>
      
       <div className="absolute bottom-4 text-xs text-muted-foreground font-mono">
            Scanning price history...
       </div>
    </div>
  );
}
