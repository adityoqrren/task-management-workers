import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskDeleted(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, taskId, taskTitle, assignedUserId } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // // get task
    // const {title: taskTitle} = await getTaskById(taskId, true);

    // send to db
    const log = await createLog({
      data: {
        eventId,
        type: 'task.deleted',
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} deleted task ${taskTitle}`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      }
    });

    if (!log) {
      throw new Error("Log delete task error to save");
    }

    console.log("Log delete task success to save");
  } catch (error) {
    console.log(`error log delete task : ${error.message}`);
  }
};