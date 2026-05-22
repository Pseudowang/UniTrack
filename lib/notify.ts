import type { Notification } from "@prisma/client";
import prisma from "./db";

/**
 * 发送应用内通知。
 * 当前实现只更新数据库状态，后续可替换为邮件、短信或推送渠道。
 */
export async function notify(notification: Notification) {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[notify] 已发送 ${notification.channel} 通知 ${notification.id}，关联变更 ${notification.changeEventId}`
    );
  }

  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      status: "sent",
      sendAt: new Date(),
    },
  });
}
