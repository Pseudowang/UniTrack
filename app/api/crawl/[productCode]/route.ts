import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { crawlTrackedItem } from "@/lib/crawl";
import { auth } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: { productCode: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productCode = params.productCode;

  const trackedItems = await prisma.trackedItem.findMany({
    where: { productCode },
  });

  if (trackedItems.length === 0) {
    return NextResponse.json(
      { error: "Tracked item not found" },
      { status: 404 }
    );
  }

  const results = [];

  for (const item of trackedItems) {
    const result = await crawlTrackedItem(item);
    results.push({
      trackedItemId: item.id,
      skipped: result.skipped,
      reason: result.reason,
      snapshotId: result.snapshot?.id,
      changeEventId: result.changeEvent?.id,
      notificationId: result.notification?.id,
    });
  }

  return NextResponse.json({
    productCode,
    results,
  });
}
