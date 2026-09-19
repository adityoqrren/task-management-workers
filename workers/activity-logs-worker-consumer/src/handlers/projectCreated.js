import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleProjectCreated(event) {
  console.log(`message in handleProjectCreated: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { projectId, projectName } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // // get data project
    // const { name: projectName } = await getProjectById(projectId);

    // send to db
    const logSaved = await createLog({
      data: {
        eventId,
        type: 'project.created',
        targetUserId: null,
        actorId,
        message: `${actorName} created project "${projectName}".`,
        entityType: 'project',
        entityId: projectId,
        entityTitle: projectName,
        projectName,
        projectId
      }
    });

    if (!logSaved) {
      throw new Error("Log create project error to save");
    }

    console.log("Log create project success to save");
  } catch (error) {
    console.log(`error log create project : ${error.message}`);
  }
};