import { createNotificationsForRecipients } from "../createNotifications.js";

const resolveDeletedRecipients = (assignedUserId, actorId) =>
  assignedUserId && assignedUserId !== actorId ? [assignedUserId] : [];

export default async function handleTaskDeleted(event) {
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  await createNotificationsForRecipients({
    eventId,
    type: "task.deleted",
    actorId,
    recipientIds: resolveDeletedRecipients(assignedUserId, actorId),
    title: "Task Deleted",
    message: `Task "${taskTitle}" in project "${projectName}" was deleted.`,
    entityType: "task",
    entityId: taskId,
    projectId,
  });
}
