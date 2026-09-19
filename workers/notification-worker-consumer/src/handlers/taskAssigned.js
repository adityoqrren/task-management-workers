import prisma from "../config/db.js";
import { publishNotification } from "../publishNotification.js";

export default async function handleTaskAssigned(event) {

  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;

  try {
    // send to db
    const notif = await prisma.notifications.create({
      data: {
        eventId,
        type: 'task.assigned',
        recipientId: payload.assignedUserId,
        actorId,
        title: 'Task Assigned',
        message: `You were assigned to task "${payload.taskTitle}" in project "${payload.projectName}".`,
        entityType: 'task',
        entityId: payload.taskId,
        projectId: payload.projectId,
      }
    });

    if (!notif) {
      throw new Error("Notif assign task error to save");
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

    console.log("Notif assign task success to save");
  } catch (error) {
    console.log(`error assign task : ${error.message}`);
  }
}
