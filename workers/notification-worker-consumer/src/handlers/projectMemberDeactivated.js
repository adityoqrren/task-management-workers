import { createNotificationsForRecipients } from "../createNotifications.js";

export default async function handleProjectMemberDeactivated(event) {
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId, releasedTaskCount = 0 } = payload;

  await createNotificationsForRecipients({
    eventId,
    type: "project.member.deactivated",
    actorId,
    recipientIds: [memberUserId],
    title: "Project Membership Deactivated",
    message: `You were deactivated from project "${projectName}". ${releasedTaskCount} task assignment(s) were released.`,
    entityType: "project",
    entityId: projectId,
    projectId,
  });
}
