import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleProjectUpdated(event) {
  console.log(`message in handleProjectUpdated: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // // get data project
    // const { name: projectName } = await getProjectById(projectId, false);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.updated',
        targetUserId: null,
        actorId,
        message: `${actorName} updated project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log update project error to save");
    }

    console.log("Log update project success to save");
  } catch (error) {
    console.log(`error log update project : ${error.message}`);
  }
};