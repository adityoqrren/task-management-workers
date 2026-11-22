import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskUnarchived(event) {
  console.log(`message in handleTaskUnarchived: ${JSON.stringify(event)}`);
  const { id: eventId, actorId, payload } = event;
  const { taskId, taskTitle, projectId, projectName, assignedUserId } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const logSaved = await createLog({
      data: {
        eventId,
        type: "task.unarchived",
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} unarchived task "${taskTitle}".`,
        entityType: "task",
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId,
      }
    });

    if (!logSaved) {
      throw new Error("Log unarchive task error to save");
    }

    console.log("Log unarchive task success to save");
  } catch (error) {
    console.log(`error log unarchive task : ${error.message}`);
  }
}
