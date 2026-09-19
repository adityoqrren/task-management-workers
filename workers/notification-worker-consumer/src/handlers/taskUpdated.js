import prisma from "../config/db.js";
import { publishNotification } from "../publishNotification.js";

export default async function handleTaskUpdated(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;

  // if assignedUserId == null so no notif -> actorId = owner
  if (!payload.assignedUserId) return;

  // if assignedUserId == actorId, recipient = ownerId
  // if assignedUserId != actorId, recipient = assignedUserId
  const recipientId = payload.assignedUserId == actorId ? payload.ownerId : payload.assignedUserId

  try {
    // send to db
    const notif = await prisma.notifications.create({
      data: {
        eventId,
        type: 'task.updated',
        recipientId,
        actorId,
        title: 'Task Updated',
        message: `Task "${payload.taskTitle}" in project "${payload.projectName}" was updated.`,
        entityType: 'task',
        entityId: payload.taskId,
        projectId: payload.projectId,
      }
    });

    if (!notif) {
      throw new Error("Notif update task error to save");
    }

    // publish notification to redis pub sub
    await publishNotification(notif.recipientId, {
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      projectId: notif.projectId,
      entityType: notif.entityType,
      entityId: notif.entityId,
      createdAt: notif.createdAt
    });

    console.log("Notif update task success to save");
  } catch (error) {
    console.log(`error update task : ${error.message}`);
  }
};