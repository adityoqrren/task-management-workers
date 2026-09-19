import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleTaskCreated(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, taskId, taskTitle } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // get task
    // const { title: taskTitle } = await getTaskById(taskId);

    // send to db
    const log = await createLog({
      data: {
        eventId,
        type: 'task.created',
        targetUserId: null,
        actorId,
        message: `${actorName} created task ${taskTitle}`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      }
    });

    if (!log) {
      throw new Error("Log create task error to save");
    }

    console.log("Log create task success to save");
  } catch (error) {
    console.log(`error log create task : ${error.message}`);
  }
};