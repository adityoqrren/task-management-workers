import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectArchived(event) {
  console.log(`message in handleProjectArchived: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, archivedTaskCount = 0 } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "project.archived",
        targetUserId: null,
        actorId,
        message: `${actorName} archived project "${projectName}" (${archivedTaskCount} task(s) archived).`,
        entityType: "project",
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId,
      }
    });

    if (!logSaved) {
      throw new Error("Log archive project error to save");
    }

    console.log("Log archive project success to save");
  } catch (error) {
    console.log(`error log archive project : ${error.message}`);
  }
}
