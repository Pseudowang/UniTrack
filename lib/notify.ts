import type { Notification } from "@prisma/client";

/**
 * noop notification hook kept for future integrations.
 * Replace with email/SMS provider when ready.
 */
export async function notify(notification: Notification) {
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[notify] queued ${notification.channel} notification ${notification.id} for change ${notification.changeEventId}`
    );
  }

  return Promise.resolve();
}
