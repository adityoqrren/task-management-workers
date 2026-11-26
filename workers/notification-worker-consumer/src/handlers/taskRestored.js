import { createNotificationsForRecipients } from "../createNotifications.js";
import { resolveArchiveRecipients } from "../recipients.js";

export default async function handleTaskRestored(event) {
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  const recipientIds = await resolveArchiveRecipients({
    projectId,
    actorId,
    candidateUserIds: [assignedUserId],
  });

  await createNotificationsForRecipients({
    eventId,
    type: "task.restored",
    actorId,
    recipientIds,
    title: "Task Restored",
    message: `Task "${taskTitle}" in project "${projectName}" was restored.`,
    entityType: "task",
    entityId: taskId,
    projectId,
  });
}
