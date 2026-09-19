import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleTaskAssigned(event) {

  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, assignedUserId, taskId, taskTitle } = payload;

  try {
    // get data actor
    const { name: actorName } = await getUserById(actorId);
    // get data target
    const { name: targetUserName } = await getUserById(assignedUserId);
    // // get task
    // const { title: taskTitle } = await getTaskById(taskId);

    // send to db
    const log = await createLog({
      data: {
        eventId,
        type: 'task.assigned',
        targetUserId: assignedUserId,
        actorId,
        message: `${actorName} assigned task ${taskTitle} to ${targetUserName}`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      }
    });

    if (!log) {
      throw new Error("Log assign task error to save");
    }

    console.log("Log assign task success to save");
  } catch (error) {
    console.log(`error log assign task : ${error.message}`);
  }
}
