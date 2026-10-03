import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskCompleted(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, actorId, payload } = event;
  const {
    taskId,
    taskTitle,
    projectId,
    projectName,
    assignedUserId,
    ownerId,
  } = payload;

  // get data actor
  const { name: actorName } = await getUserById(actorId);
  // // get task
  // const { title: taskTitle } = await getTaskById(taskId);

  let targetUserId;
  let message;

  // Case 1: task completed by OWNER → notify ASSIGNEE
  if (actorId === ownerId) {
    targetUserId = assignedUserId;
    message = `${actorName} (as owner) completed task ${taskTitle}`;
  }

  // Case 2: task completed by ASSIGNEE → notify OWNER
  if (actorId === assignedUserId) {
    targetUserId = ownerId;
    message = `${actorName} (as member) completed task ${taskTitle}`;
  }

  // Safety check
  if (!targetUserId) {
    console.warn('[TASK_COMPLETED] No recipient resolved', {
      eventId,
      actorId,
      payload,
    });
    return;
  }

  try {
    // send to db
    const notif = await createLog({
      data: {
        eventId,
        type: 'task.completed',
        targetUserId,
        actorId,
        message,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      },
    });

    if (!notif) {
      throw new Error("Log complete task error to save");
    }

    console.log("Log complete task success to save");
  } catch (error) {
    console.log(`error log complete task : ${error.message}`);
  }
};