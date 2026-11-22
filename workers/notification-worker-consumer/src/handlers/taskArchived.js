import { createNotificationsForRecipients } from "../createNotifications.js";
import { resolveArchiveRecipients } from "../recipients.js";

export default async function handleTaskArchived(event) {
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId, ownerId } = payload;

  const recipientIds = await resolveArchiveRecipients({
    projectId,
    actorId,
    candidateUserIds: [assignedUserId, ownerId],
  });

  await createNotificationsForRecipients({
    eventId,
    type: "task.archived",
    actorId,
    recipientIds,
    title: "Task Archived",
    message: `Task "${taskTitle}" in project "${projectName}" was archived.`,
    entityType: "task",
    entityId: taskId,
    projectId,
  });
}
