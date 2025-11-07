import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@unitrack.local" },
    update: {},
    create: {
      email: "demo@unitrack.local",
      passwordHash,
    },
  });

  await prisma.trackedItem.upsert({
    where: {
      userId_productCode: {
        userId: user.id,
        productCode: "465167",
      },
    },
    update: {},
    create: {
      userId: user.id,
      productCode: "465167",
      url: "https://www.uniqlo.cn/product-detail.html?productCode=465167",
      title: "UNIQLO AIRism Demo Shirt",
      filters: {},
    },
  });

  console.log("Seed complete: demo user demo@unitrack.local / password123");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
