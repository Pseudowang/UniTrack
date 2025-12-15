export interface SnapshotComparable {
  title?: string | null;
  priceCent?: number | null;
  listPriceCent?: number | null;
  inStock?: boolean | null;
}

import type { Prisma } from "@prisma/client";

type Jsonish = Prisma.InputJsonValue;

type SnapshotDiffPayload = Record<
  string,
  {
    previous: Jsonish;
    current: Jsonish;
  }
>;

export interface SnapshotDiff {
  changed: boolean;
  changeType: "created" | "updated" | "none";
  diff: SnapshotDiffPayload;
}

// 只关心商品标题、价格、列表价格和库存状态
const FIELDS: (keyof SnapshotComparable)[] = [
  "title",
  "priceCent",
  "listPriceCent",
  "inStock",
];

// 比较两个商品快照的差异
export function diffSnapshots(
  previous: SnapshotComparable | null | undefined,
  next: SnapshotComparable
): SnapshotDiff {
  const diff: SnapshotDiff["diff"] = {};

  for (const field of FIELDS) {
    // 比较字段值
    const prevValue = (previous?.[field] ?? null) as Jsonish;
    const nextValue = ((next as SnapshotComparable)[field] ?? null) as Jsonish;

    if (!isEqual(prevValue, nextValue)) {
      diff[field] = {
        previous: prevValue,
        current: nextValue,
      };
    }
  }

  if (!previous) {
    // 如果没有前一个快照，说明是新商品
    return {
      changed: true,
      changeType: "created",
      diff,
    };
  }

  if (Object.keys(diff).length === 0) {
    return {
      changed: false,
      changeType: "none",
      diff: {},
    };
  }

  return {
    changed: true,
    changeType: "updated",
    diff,
  };
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a === null || b === null) {
    return a === b;
  }

  if (typeof a === "object" && typeof b === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return false;
}
