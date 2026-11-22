import { createNotificationsForRecipients } from "../createNotifications.js";
import { resolveArchiveRecipients } from "../recipients.js";

export default async function handleTaskUnarchived(event) {
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId, ownerId } = payload;

  const recipientIds = await resolveArchiveRecipients({
    projectId,
    actorId,
    candidateUserIds: [assignedUserId, ownerId],
  });

  await createNotificationsForRecipients({
    eventId,
    type: "task.unarchived",
    actorId,
    recipientIds,
    title: "Task Unarchived",
    message: `Task "${taskTitle}" in project "${projectName}" was unarchived.`,
    entityType: "task",
    entityId: taskId,
    projectId,
  });
}
