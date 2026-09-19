import { createLog, getUserById } from "../repository/ActivityLogRepository.js";

export default async function handleTaskAttachmentAdded(event) {
    console.log(`message: ${JSON.stringify(event)}`);

    const { id: eventId, payload, actorId } = event;

    const {
        taskId,
        taskTitle,
        projectId,
        projectName,
        fileName,
    } = payload;

    try {
        const { name: actorName } = await getUserById(actorId);

        const log = await createLog({
            data: {
                eventId,
                type: "task.attachment.added",
                targetUserId: null,
                actorId,
                entityType: "task",
                entityId: taskId,
                entityTitle: taskTitle,
                projectId,
                projectName,
                taskId,
                message: `${actorName} added attachment ${fileName} to task ${taskTitle}`,
            },
        });

        if (!log) {
            throw new Error("Log add task attachment error to save");
        }

        console.log("Log add task attachment success to save");
    } catch (error) {
        console.log(`error log add task attachment: ${error.message}`);
    }
}