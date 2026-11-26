import { createNotificationsForRecipients } from "../createNotifications.js";

const resolveUnassignedRecipients = (assignedUserId, actorId) =>
  assignedUserId && assignedUserId !== actorId ? [assignedUserId] : [];

export default async function handleTaskUnassigned(event) {
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  await createNotificationsForRecipients({
    eventId,
    type: "task.unassigned",
    actorId,
    recipientIds: resolveUnassignedRecipients(assignedUserId, actorId),
    title: "Task Unassigned",
    message: `You were unassigned from task "${taskTitle}" in project "${projectName}".`,
    entityType: "task",
    entityId: taskId,
    projectId,
  });
}
