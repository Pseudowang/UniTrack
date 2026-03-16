import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: itemId } = await params;
  if (!itemId) {
    return NextResponse.json(
      { error: "缺少追踪商品 ID" },
      { status: 400 }
    );
  }

  const trackedItem = await prisma.trackedItem.findFirst({
    where: {
      id: itemId,
      userId: session.user.id,
    },
  });

  if (!trackedItem) {
    return NextResponse.json(
      { error: "追踪商品不存在" },
      { status: 404 }
    );
  }

  await prisma.trackedItem.delete({
    where: { id: trackedItem.id },
  });

  return NextResponse.json({ message: "deleted" });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: itemId } = await params;
  if (!itemId) {
    return NextResponse.json({ error: "Missing item ID" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  if (!json || typeof json.targetPrice !== "number") {
    return NextResponse.json(
      { error: "Invalid payload: targetPrice must be a number" },
      { status: 400 }
    );
  }

  const trackedItem = await prisma.trackedItem.findFirst({
    where: {
      id: itemId,
      userId: session.user.id,
    },
  });

  if (!trackedItem) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // Merge with existing filters
  const currentFilters = (trackedItem.filters as Record<string, any>) || {};
  const updatedFilters = {
    ...currentFilters,
    targetPrice: json.targetPrice,
  };

  const updatedItem = await prisma.trackedItem.update({
    where: { id: itemId },
    data: {
      filters: updatedFilters,
    },
  });

  return NextResponse.json({
    message: "updated",
    item: updatedItem,
  });
}
