import prisma from "./config/db.js";
import { publishNotification } from "./publishNotification.js";

export const createNotificationsForRecipients = async ({
  eventId,
  type,
  actorId,
  recipientIds = [],
  title,
  message,
  entityType,
  entityId,
  projectId,
}) => {
  const uniqueRecipientIds = [...new Set(recipientIds.filter(Boolean))];

  if (uniqueRecipientIds.length === 0) {
    console.log(`[NOTIFICATION] no recipients for event ${eventId} (${type})`);
    return [];
  }

  const created = await prisma.notifications.createManyAndReturn({
    data: uniqueRecipientIds.map((recipientId) => ({
      eventId,
      type,
      recipientId,
      actorId,
      title,
      message,
      entityType,
      entityId,
      projectId,
    })),
    skipDuplicates: true,
  });

  for (const notif of created) {
    await publishNotification(notif.recipientId, {
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      projectId: notif.projectId,
      entityType: notif.entityType,
      entityId: notif.entityId,
      createdAt: notif.createdAt,
    });
  }

  console.log(`[NOTIFICATION] created ${created.length} row(s) for event ${eventId} (${type})`);
  return created;
};
