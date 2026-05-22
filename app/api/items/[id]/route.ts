import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { successResponse, handleRouteError } from "@/lib/api-response";
import { AppError, ErrorCode } from "@/lib/errors";
import { targetPricePayloadSchema } from "@/lib/validators";
import { parseTrackedItemFilters } from "@/types";

/**
 * 删除当前用户的追踪商品。
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const { id: itemId } = await params;
    if (!itemId) {
      throw new AppError(ErrorCode.BAD_REQUEST, "缺少追踪商品 ID", 400);
    }

    const trackedItem = await prisma.trackedItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    });

    if (!trackedItem) {
      throw new AppError(ErrorCode.NOT_FOUND, "追踪商品不存在", 404);
    }

    await prisma.trackedItem.delete({
      where: { id: trackedItem.id },
    });

    return successResponse(
      {
        id: trackedItem.id,
      },
      "已停止追踪该商品"
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * 更新追踪商品的目标价格配置。
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new AppError(ErrorCode.UNAUTHORIZED, "请先登录", 401);
    }

    const { id: itemId } = await params;
    if (!itemId) {
      throw new AppError(ErrorCode.BAD_REQUEST, "缺少追踪商品 ID", 400);
    }

    const json = await request.json().catch(() => null);
    const payload = targetPricePayloadSchema.parse(json);

    const trackedItem = await prisma.trackedItem.findFirst({
      where: {
        id: itemId,
        userId: session.user.id,
      },
    });

    if (!trackedItem) {
      throw new AppError(ErrorCode.NOT_FOUND, "追踪商品不存在", 404);
    }

    const currentFilters = parseTrackedItemFilters(trackedItem.filters);
    const updatedItem = await prisma.trackedItem.update({
      where: { id: itemId },
      data: {
        filters: {
          ...currentFilters,
          targetPrice: payload.targetPrice,
        },
      },
    });

    return successResponse(
      {
        item: updatedItem,
      },
      "期望价格已更新"
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
