import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskArchivedByProject(event) {
  console.log(`message in handleTaskArchivedByProject: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "task.archived.by_project",
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} archived task "${taskTitle}" because project "${projectName}" was archived.`,
        entityType: "task",
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId,
      }
    });

    if (!logSaved) {
      throw new Error("Log archive task by project error to save");
    }

    console.log("Log archive task by project success to save");
  } catch (error) {
    console.log(`error log archive task by project : ${error.message}`);
  }
}
