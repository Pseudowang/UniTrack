import type { ProductSnapshot, Prisma, TrackedItem } from "@prisma/client";

export interface TrackedItemFilters {
  targetPrice?: number;
}

export type TrackedItemWithLatestSnapshot = TrackedItem & {
  snapshots: ProductSnapshot[];
};

export function parseTrackedItemFilters(
  filters: Prisma.JsonValue | null | undefined
): TrackedItemFilters {
  if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
    return {};
  }

  return {
    targetPrice:
      typeof filters.targetPrice === "number" ? filters.targetPrice : undefined,
  };
}
