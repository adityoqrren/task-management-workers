import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskArchived(event) {
  console.log(`message in handleTaskArchived: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "task.archived",
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} archived task "${taskTitle}".`,
        entityType: "task",
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId,
      }
    });

    if (!logSaved) {
      throw new Error("Log archive task error to save");
    }

    console.log("Log archive task success to save");
  } catch (error) {
    console.log(`error log archive task : ${error.message}`);
  }
}
