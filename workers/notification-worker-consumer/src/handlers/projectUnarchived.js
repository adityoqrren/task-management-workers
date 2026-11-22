import { createNotificationsForRecipients } from "../createNotifications.js";
import { resolveArchiveRecipients } from "../recipients.js";

export default async function handleProjectUnarchived(event) {
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, unarchivedTaskCount = 0 } = payload;

  const recipientIds = await resolveArchiveRecipients({ projectId, actorId });

  await createNotificationsForRecipients({
    eventId,
    type: "project.unarchived",
    actorId,
    recipientIds,
    title: "Project Unarchived",
    message: `Project "${projectName}" was unarchived. ${unarchivedTaskCount} task(s) were restored.`,
    entityType: "project",
    entityId: projectId,
    projectId,
  });
}
