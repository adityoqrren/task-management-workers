import { createNotificationsForRecipients } from "../createNotifications.js";
import { resolveArchiveRecipients } from "../recipients.js";

export default async function handleProjectArchived(event) {
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, archivedTaskCount = 0 } = payload;

  const recipientIds = await resolveArchiveRecipients({ projectId, actorId });

  await createNotificationsForRecipients({
    eventId,
    type: "project.archived",
    actorId,
    recipientIds,
    title: "Project Archived",
    message: `Project "${projectName}" was archived. ${archivedTaskCount} task(s) were archived.`,
    entityType: "project",
    entityId: projectId,
    projectId,
  });
}
