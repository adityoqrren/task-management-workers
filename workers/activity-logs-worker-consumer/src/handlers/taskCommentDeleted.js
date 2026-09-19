import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleTaskCommentDeleted(event) {
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
        type: "task.comment.deleted",
        targetUserId: null,
        actorId,
        message: `${actorName} deleted a comment on task ${taskTitle}: "${commentPreview}"`,
        entityType: "task_comment",
        entityId: commentId,
        entityTitle: commentPreview,
        taskId,
        projectId,
        projectName,
      },
    });

    if (!log) {
      throw new Error("Log delete task comment error to save");
    }

    console.log("Log delete task comment success to save");
  } catch (error) {
    console.log(`error log delete task comment: ${error.message}`);
  }
}