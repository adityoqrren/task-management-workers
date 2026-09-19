import prisma from "../config/db.js";
import { publishNotification } from "../publishNotification.js";

export default async function handleProjectMemberAdded(event) {
  console.log(`message in handleProjectMemberAdded: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId } = payload;

  try {
    // send to db
    const notif = await prisma.notifications.create({
      data: {
        eventId,
        type: 'project.member.added',
        recipientId: memberUserId,
        actorId,
        title: 'Added to Project',
        message: `You were added to project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        projectId
      }
    });

    if (!notif) {
      throw new Error("Notif add member to project error to save");
    }

    // publish notification to redis pub sub
    await publishNotification(memberUserId, {
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      projectId,
      entityType: notif.entityType,
      entityId: notif.entityId,
      createdAt: notif.createdAt
    });

    console.log("Notif add member to project success to save");
  } catch (error) {
    console.log(`error add member : ${error.message}`);
  }
};