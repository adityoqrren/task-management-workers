import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectMemberReactivated(event) {
  console.log(`message in handleProjectMemberReactivated: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);
    const { name: targetUserName } = await getUserById(memberUserId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "project.member.reactivated",
        targetUserId: memberUserId,
        actorId,
        message: `${actorName} reactivated ${targetUserName} in project "${projectName}".`,
        entityType: "project",
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId,
      }
    });

    if (!logSaved) {
      throw new Error("Log reactivate member error to save");
    }

    console.log("Log reactivate member success to save");
  } catch (error) {
    console.log(`error log reactivate member : ${error.message}`);
  }
}
