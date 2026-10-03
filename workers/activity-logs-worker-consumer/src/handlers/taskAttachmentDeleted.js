import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskAttachmentDeleted(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;

  const {
    taskId,
    taskTitle,
    projectId,
    projectName,
    fileName,
    attachmentOwnerId,
  } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const log = await createLog({
      data: {
        eventId,
        type: "task.attachment.deleted",

        // The actor is the user who deleted the attachment.
        actorId,

        // No target user is necessary for this activity.
        targetUserId: null,

        entityType: "task",
        entityId: taskId,
        entityTitle: taskTitle,

        projectId,
        projectName,

        taskId,

        message: `${actorName} deleted attachment ${fileName} from task ${taskTitle}`,
      },
    });

    if (!log) {
      throw new Error("Log delete task attachment error to save");
    }

    console.log("Log delete task attachment success to save");
  } catch (error) {
    console.log(`error log delete task attachment: ${error.message}`);
  }
}