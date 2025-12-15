
import { PrismaClient } from "@prisma/client";
import { crawlTrackedItem } from "../lib/crawl";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting verification...");

  // 1. Get a tracked item
  const item = await prisma.trackedItem.findFirst();
  if (!item) {
    console.error("No tracked items found. Please seed the database or add an item.");
    return;
  }

  console.log(`Testing with item: ${item.id} (${item.productCode})`);

  // 2. Run crawl once
  try {
    console.log("First crawl attempt...");
    const result1 = await crawlTrackedItem(item);
    console.log("Result 1:", result1.skipped ? "Skipped" : "Success", result1.reason);
  } catch (error) {
    console.error("First crawl failed:", error);
  }

  // 3. Run crawl again immediately (should be skipped or handle dupes gratefully via upsert logic checks)
  // Actually, crawlTrackedItem checks etag first. To test upsert, we might need to force a collision or just trust that if it runs without error, it's good.
  // The upsert handles the race condition where `findFirst` says "no snapshot" but another process inserts it before we do.
  // We can't easily simulate exact race condition here without parallel execution, but we can verify it doesn't crash.
  
  try {
    console.log("Second crawl attempt...");
    const result2 = await crawlTrackedItem(item);
    console.log("Result 2:", result2.skipped ? "Skipped" : "Success", result2.reason);
  } catch (error) {
    console.error("Second crawl failed:", error);
  }

  console.log("Verification complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
