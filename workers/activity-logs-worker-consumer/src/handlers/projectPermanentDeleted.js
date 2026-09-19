import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleProjectPermanentDeleted(event) {
  console.log(`message in handleProjectPermanentDeleted: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.permanent.deleted',
        targetUserId: null,
        actorId,
        message: `${actorName} permanently deleted project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log permanent delete project error to save");
    }

    console.log("Log permanent delete project success to save");
  } catch (error) {
    console.log(`error log permanent delete project : ${error.message}`);
  }
};