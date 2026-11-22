import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectUnarchived(event) {
  console.log(`message in handleProjectUnarchived: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName, unarchivedTaskCount = 0 } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "project.unarchived",
        targetUserId: null,
        actorId,
        message: `${actorName} unarchived project "${projectName}" (${unarchivedTaskCount} task(s) restored).`,
        entityType: "project",
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId,
      }
    });

    if (!logSaved) {
      throw new Error("Log unarchive project error to save");
    }

    console.log("Log unarchive project success to save");
  } catch (error) {
    console.log(`error log unarchive project : ${error.message}`);
  }
}
