import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleProjectRestored(event) {
  console.log(`message in handleProjectRestored: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // get data project
    // const { name: projectName } = await getProjectById(projectId, false);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.restored',
        targetUserId: null,
        actorId,
        message: `${actorName} restored project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log restore project error to save");
    }

    console.log("Log restore project success to save");
  } catch (error) {
    console.log(`error log restore project : ${error.message}`);
  }
};