import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskCommentUpdated(event) {
  console.log(`message: ${JSON.stringify(event)}`);

  const { id: eventId, payload, actorId } = event;

  const {
    commentId,
    taskId,
    taskTitle,
    projectId,
    projectName,
    commentOwnerId,
    commentPreview,
  } = payload;

  try {
    const { name: actorName } = await getUserById(actorId);

    const log = await createLog({
      data: {
        eventId,
        type: "task.comment.updated",
        targetUserId: null,
        actorId,
        message: `${actorName} updated their comment on task ${taskTitle}: "${commentPreview}"`,
        entityType: "task_comment",
        entityId: commentId,
        entityTitle: commentPreview,
        taskId,
        projectId,
        projectName,
      },
    });

    if (!log) {
      throw new Error("Log update task comment error to save");
    }

    console.log("Log update task comment success to save");
  } catch (error) {
    console.log(`error log update task comment: ${error.message}`);
  }
}