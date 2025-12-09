import { ProductPlaceholder } from "./product-placeholder";
import { TrendChartAnimation } from "./trend-chart-animation";

export function PriceTrendHero() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 p-2 sm:p-4 shadow-2xl overflow-hidden backdrop-blur-sm">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-teal-200/20 dark:bg-teal-800/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-[300px] md:h-[320px]">
           
           {/* Left Panel: Product Preview (30-40%) */}
           <div className="md:col-span-4 h-full bg-white dark:bg-gray-900/50 rounded-xl border border-teal-100/50 dark:border-teal-900/30 p-4 shadow-sm">
             <ProductPlaceholder />
           </div>

           {/* Right Panel: Animation (60-70%) */}
           <div className="md:col-span-8 h-full rounded-xl overflow-hidden relative">
              <TrendChartAnimation />
           </div>

        </div>

      </div>
    </div>
  );
}
