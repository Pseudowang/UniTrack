import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { trackedItemPayloadSchema } from "@/lib/validators";
import { parseProductCode } from "@/lib/product-code";
import { UNIQLO_SPU_API_BASE } from "@/lib/scraper";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);

  const parsed = trackedItemPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }

  let productCode: string;
  let isUrl = false;
  let kind: "detail" | "api" | "code" = "code";
  try {
    const result = parseProductCode(parsed.data.value);
    productCode = result.productCode;
    isUrl = result.isUrl;
    kind = result.kind;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unsupported product URL or code",
      },
      { status: 400 }
    );
  }

  const normalizedUrl = isUrl
    ? parsed.data.value.trim()
    : kind === "api"
      ? `${UNIQLO_SPU_API_BASE}/${productCode.toLowerCase()}.json`
      : `https://www.uniqlo.cn/product-detail.html?productCode=${productCode}`;

  const existing = await prisma.trackedItem.findUnique({
    where: {
      userId_productCode: {
        userId: session.user.id,
        productCode,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        message: "already-tracking",
        item: existing,
      },
      { status: 200 }
    );
  }

  const item = await prisma.trackedItem.create({
    data: {
      userId: session.user.id,
      productCode,
      url: normalizedUrl,
      filters: {},
    },
  });

  return NextResponse.json(
    {
      message: "created",
      item,
    },
    { status: 201 }
  );
}
