import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectMemberDeactivated(event) {
  console.log(`message in handleProjectMemberDeactivated: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, memberUserId, releasedTaskCount = 0 } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);
    const { name: targetUserName } = await getUserById(memberUserId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "project.member.deactivated",
        targetUserId: memberUserId,
        actorId,
        message: `${actorName} deactivated ${targetUserName} in project "${projectName}" (${releasedTaskCount} task assignment(s) released).`,
        entityType: "project",
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId,
      }
    });

    if (!logSaved) {
      throw new Error("Log deactivate member error to save");
    }

    console.log("Log deactivate member success to save");
  } catch (error) {
    console.log(`error log deactivate member : ${error.message}`);
  }
}
