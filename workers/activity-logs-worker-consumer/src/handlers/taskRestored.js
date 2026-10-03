import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskRestored(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, assignedUserId, taskId, taskTitle } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // // get task
    // const { title: taskTitle } = await getTaskById(taskId);

    // send to db
    const log = await createLog({
      data: {
        eventId,
        type: 'task.restored',
        targetUserId: assignedUserId,
        actorId,
        message: `${actorName} restored task ${taskTitle}`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      }
    });

    if (!log) {
      throw new Error("Log restore task error to save");
    }

    console.log("Log restore task success to save");
  } catch (error) {
    console.log(`error log restore task : ${error.message}`);
  }
};