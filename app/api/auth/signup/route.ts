import { hash } from "bcryptjs";
import prisma from "@/lib/db";
import { successResponse, handleRouteError } from "@/lib/api-response";
import { AppError, ErrorCode } from "@/lib/errors";
import { signUpSchema } from "@/lib/validators";

/**
 * 创建新用户账号。
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = signUpSchema.parse(payload);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      throw new AppError(ErrorCode.CONFLICT, "该邮箱已被注册", 409);
    }

    const passwordHash = await hash(parsed.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return successResponse(
      {
        user,
      },
      "注册成功",
      201
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
