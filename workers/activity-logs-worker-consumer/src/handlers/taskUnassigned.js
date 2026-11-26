import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskUnassigned(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;
  const { projectId, projectName, assignedUserId, taskId, taskTitle } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);
    const { name: targetUserName } = await getUserById(assignedUserId);

    const log = await createLog({
      data: {
        eventId,
        type: 'task.unassigned',
        targetUserId: assignedUserId ?? null,
        actorId,
        message: `${actorName} unassigned ${targetUserName} from task ${taskTitle}`,
        entityType: 'task',
        entityId: taskId,
        entityTitle: taskTitle,
        projectName,
        projectId,
        taskId
      }
    });

    if (!log) {
      throw new Error("Log unassign task error to save");
    }

    console.log("Log unassign task success to save");
  } catch (error) {
    console.log(`error log unassign task : ${error.message}`);
  }
}
