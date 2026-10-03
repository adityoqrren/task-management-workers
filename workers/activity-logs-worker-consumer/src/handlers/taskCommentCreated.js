import { createLog, getUserById } from "../repository/activityLogRepository.js";

export default async function handleTaskCommentCreated(event) {
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
    // Get actor data
    const { name: actorName } = await getUserById(actorId);

    // Save activity log
    const log = await createLog({
      data: {
        eventId,
        type: "task.comment.created",
        targetUserId: null,
        actorId,
        message: `${actorName} commented on task ${taskTitle}: "${commentPreview}"`,
        entityType: "task_comment",
        entityId: commentId,
        entityTitle: commentPreview,
        projectId,
        projectName,
        taskId,
      },
    });

    if (!log) {
      throw new Error("Log create task comment error to save");
    }

    console.log("Log create task comment success to save");
  } catch (error) {
    console.log(`error log create task comment: ${error.message}`);
  }
}