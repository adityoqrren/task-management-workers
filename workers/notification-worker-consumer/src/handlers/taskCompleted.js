import prisma from "../config/db.js";
import { publishNotification } from "../publishNotification.js";

export default async function handleTaskCompleted(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, actorId, payload } = event;
  const {
    taskId,
    taskTitle,
    projectId,
    projectName,
    assignedUserId,
    ownerId,
  } = payload;

  let recipientId;
  let title;
  let message;

  // Case 1: task completed by OWNER → notify ASSIGNEE
  if (actorId === ownerId) {
    recipientId = assignedUserId;
    title = 'Task Completed';
    message = `Task "${taskTitle}" in project "${projectName}" was marked as completed by the owner.`;
  }

  // Case 2: task completed by ASSIGNEE → notify OWNER
  if (actorId === assignedUserId) {
    recipientId = ownerId;
    title = 'Task Completed by Member';
    message = `Task "${taskTitle}" in project "${projectName}" was completed by the assignee.`;
  }

  // Safety check
  if (!recipientId) {
    console.warn('[TASK_COMPLETED] No recipient resolved', {
      eventId,
      actorId,
      payload,
    });
    return;
  }

  try {
    // send to db
    const notif = await prisma.notifications.create({
      data: {
        eventId,
        type: 'task.completed',
        recipientId,
        actorId,
        title,
        message,
        entityType: 'task',
        entityId: taskId,
        projectId,
      },
    });

    if (!notif) {
      throw new Error("Notif complete task error to save");
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

    console.log("Notif complete task success to save");
  } catch (error) {
    console.log(`error complete task : ${error.message}`);
  }
};