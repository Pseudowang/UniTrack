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

const FIELDS: (keyof SnapshotComparable)[] = [
  "title",
  "priceCent",
  "listPriceCent",
  "inStock",
];

export function diffSnapshots(
  previous: SnapshotComparable | null | undefined,
  next: SnapshotComparable
): SnapshotDiff {
  const diff: SnapshotDiff["diff"] = {};

  for (const field of FIELDS) {
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
