import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const itemId = params.id;
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
