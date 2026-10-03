import prisma from "../config/db.js";
import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectMemberAdded(event) {
  console.log(`message in handleProjectMemberAdded: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // get data target
    const { name: targetUserName } = await getUserById(memberUserId);
    // get data project
    // const { name: projectName } = await getProjectById(projectId);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.member.added',
        targetUserId: memberUserId,
        actorId,
        message: `${actorName} added ${targetUserName} to project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log add member to project error to save");
    }

    console.log("Log add member to project success to save");
  } catch (error) {
    console.log(`error log add member : ${error.message}`);
  }
};