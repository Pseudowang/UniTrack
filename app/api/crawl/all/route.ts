import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { crawlTrackedItem } from "@/lib/crawl";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trackedItems = await prisma.trackedItem.findMany();

  const results = [];
  for (const item of trackedItems) {
    const crawlResult = await crawlTrackedItem(item);
    results.push({
      trackedItemId: item.id,
      productCode: item.productCode,
      skipped: crawlResult.skipped,
      reason: crawlResult.reason,
      snapshotId: crawlResult.snapshot?.id,
      changeEventId: crawlResult.changeEvent?.id,
      notificationId: crawlResult.notification?.id,
    });
  }

  const created = results.filter((r) => !r.skipped).length;

  return NextResponse.json({
    total: results.length,
    created,
    skipped: results.length - created,
    results,
  });
}
