import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectDeleted(event) {
  console.log(`message in handleProjectDeleted: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // get data project
    // const { name: projectName } = await getProjectById(projectId, true);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.deleted',
        targetUserId: null,
        actorId,
        message: `${actorName} deleted project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log delete project error to save");
    }

    console.log("Log delete project success to save");
  } catch (error) {
    console.log(`error log delete project : ${error.message}`);
  }
};