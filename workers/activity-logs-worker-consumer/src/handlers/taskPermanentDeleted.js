import { createLog, getUserById } from "../repository/ActivityLogRepository.js";
export default async function handleTaskPermanentDeleted(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, taskId, taskTitle } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);

    // send to db
    const log = await createLog({
      data: {
        eventId,
        type: 'task.permanent.deleted',
        targetUserId: null,
        actorId,
        message: `${actorName} permanently deleted task "${taskTitle}"`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
      }
    });

    if (!log) {
      throw new Error("Log permanently delete task error to save");
    }

    console.log("Log permanently delete task success to save");
  } catch (error) {
    console.log(`error log permanently delete task : ${error.message}`);
  }
}