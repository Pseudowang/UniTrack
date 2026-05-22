import { ProductPlaceholder } from "@/components/landing/product-placeholder";
import { TrendChartAnimation } from "@/components/landing/trend-chart-animation";

export function PriceTrendHero() {
  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/50 p-2 shadow-2xl backdrop-blur-sm dark:border-teal-900/50 dark:bg-teal-950/20 sm:p-4">
        <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-teal-200/20 blur-3xl dark:bg-teal-800/10" />

        <div className="grid h-full min-h-[300px] grid-cols-1 gap-4 md:h-[320px] md:grid-cols-12">
          <div className="h-full rounded-xl border border-teal-100/50 bg-white p-4 shadow-sm dark:border-teal-900/30 dark:bg-gray-900/50 md:col-span-4">
            <ProductPlaceholder />
          </div>
          <div className="relative h-full overflow-hidden rounded-xl md:col-span-8">
            <TrendChartAnimation />
          </div>
        </div>
      </div>
    </div>
  );
}
