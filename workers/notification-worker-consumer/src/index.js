import handleProjectMemberAdded from './handlers/projectMemberAdded.js'
import handleProjectArchived from './handlers/projectArchived.js'
import handleProjectUnarchived from './handlers/projectUnarchived.js'
import handleTaskAssigned from './handlers/taskAssigned.js'
import handleTaskUpdated from './handlers/taskUpdated.js'
import handleTaskCompleted from './handlers/taskCompleted.js'
import handleTaskArchived from './handlers/taskArchived.js'
import handleTaskUnarchived from './handlers/taskUnarchived.js'
import { startConsumer } from './rabbitmq.js'

const AUDIT_ONLY_EVENT_TYPES = new Set([
  'task.archived.by_project',
  'task.unarchived.by_project',
])

async function handleEvent(event) {
  // task.# delivers these events, but they must never create notifications.
  if (AUDIT_ONLY_EVENT_TYPES.has(event.type)) {
    console.log('[NOTIFICATION] ignored audit-only cascade event:', event.type)
    return
  }

  switch (event.type) {
    case 'project.member.added':
      return handleProjectMemberAdded(event)

    case 'project.archived':
      return handleProjectArchived(event)

    case 'project.unarchived':
      return handleProjectUnarchived(event)

    case 'task.assigned':
      return handleTaskAssigned(event)

    case 'task.updated':
      return handleTaskUpdated(event)

    case 'task.completed':
      return handleTaskCompleted(event)

    case 'task.archived':
      return handleTaskArchived(event)

    case 'task.unarchived':
      return handleTaskUnarchived(event)

    default:
      console.log('[NOTIFICATION] ignored event:', event.type)
  }
}

startConsumer(handleEvent)
