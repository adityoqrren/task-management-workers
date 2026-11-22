import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskUnarchivedByProject(event) {
  console.log(`message in handleTaskUnarchivedByProject: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "task.unarchived.by_project",
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} unarchived task "${taskTitle}" because project "${projectName}" was unarchived.`,
        entityType: "task",
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId,
      }
    });

    if (!logSaved) {
      throw new Error("Log unarchive task by project error to save");
    }

    console.log("Log unarchive task by project success to save");
  } catch (error) {
    console.log(`error log unarchive task by project : ${error.message}`);
  }
}
