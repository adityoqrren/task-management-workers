import handleProjectMemberAdded from './handlers/projectMemberAdded.js'
import handleTaskAssigned from './handlers/taskAssigned.js'
import handleTaskUpdated from './handlers/taskUpdated.js'
import handleTaskCompleted from './handlers/taskCompleted.js'
import { startConsumer } from './rabbitmq.js'
import handleTaskCreated from './handlers/taskCreated.js'
import handleTaskDeleted from './handlers/taskDeleted.js'
import handleProjectCreated from './handlers/projectCreated.js'
import handleProjectDeleted from './handlers/projectDeleted.js'
import handleTaskPermanentDeleted from './handlers/taskPermanentDeleted.js'
import handleTaskRestored from './handlers/taskRestored.js'
import handleProjectUpdated from './handlers/projectUpdated.js'
import handleProjectRestored from './handlers/projectRestored.js'
import handleProjectPermanentDeleted from './handlers/projectPermanentDeleted.js'
import handleTaskCommentCreated from './handlers/taskCommentCreated.js'
import handleTaskCommentUpdated from './handlers/taskCommentUpdated.js'
import handleTaskCommentDeleted from './handlers/taskCommentDeleted.js'
import handleTaskAttachmentAdded from './handlers/taskAttachmentAdded.js'
import handleTaskAttachmentDeleted from './handlers/taskAttachmentDeleted.js'

async function handleEvent(event) {
  switch (event.type) {
    case 'project.created':
      return handleProjectCreated(event)

    case 'project.member.added':
      return handleProjectMemberAdded(event)

    //(new) project.updated
    case 'project.updated':
      return handleProjectUpdated(event)

    case 'project.deleted':
      return handleProjectDeleted(event)

    //(new) project.restored
    case 'project.restored':
      return handleProjectRestored(event)

    //(new) project.permanent.deleted
    case 'project.permanent.deleted':
      return handleProjectPermanentDeleted(event)

    case 'task.created':
      return handleTaskCreated(event)

    case 'task.assigned':
      return handleTaskAssigned(event)

    case 'task.updated':
      return handleTaskUpdated(event)

    case 'task.completed':
      return handleTaskCompleted(event)

    case 'task.deleted':
      return handleTaskDeleted(event)

    case 'task.restored':
      return handleTaskRestored(event)

    case 'task.permanent.deleted':
      return handleTaskPermanentDeleted(event)

    case 'task.comment.created':
      return handleTaskCommentCreated(event)

    case 'task.comment.updated':
      return handleTaskCommentUpdated(event)

    case 'task.comment.deleted':
      return handleTaskCommentDeleted(event)

    case 'task.attachment.added':
      return handleTaskAttachmentAdded(event)
      
    case 'task.attachment.deleted':
      return handleTaskAttachmentDeleted(event)

    default:
      console.log('[ACTIVITY LOGS] ignored event:', event.type)
  }
}

startConsumer(handleEvent)
