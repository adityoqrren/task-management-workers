import { createNotificationsForRecipients } from "../createNotifications.js";

export default async function handleProjectMemberReactivated(event) {
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId } = payload;

  await createNotificationsForRecipients({
    eventId,
    type: "project.member.reactivated",
    actorId,
    recipientIds: [memberUserId],
    title: "Project Membership Reactivated",
    message: `You were reactivated in project "${projectName}".`,
    entityType: "project",
    entityId: projectId,
    projectId,
  });
}
