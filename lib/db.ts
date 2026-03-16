// 创建并导出一个全局单例的 Prisma Client
import { PrismaClient } from "@prisma/client";


// Nextjs 在开发模式下，会为每个请求创建一个 PrismaClient 实例
// 在生产模式下，会为每个进程创建一个 PrismaClient 实例

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // 开发环境: 打印 SQL 查询、错误和警告，方便调试
        : ["error"], // 生存环境: 只打印错误，保持日志干净
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
