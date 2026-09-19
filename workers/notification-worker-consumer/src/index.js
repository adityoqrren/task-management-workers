import handleProjectMemberAdded from './handlers/projectMemberAdded.js'
import handleTaskAssigned from './handlers/taskAssigned.js'
import handleTaskUpdated from './handlers/taskUpdated.js'
import handleTaskCompleted from './handlers/taskCompleted.js'
import { startConsumer } from './rabbitmq.js'

async function handleEvent(event) {
  switch (event.type) {
    case 'project.member.added':
      return handleProjectMemberAdded(event)

    case 'task.assigned':
      return handleTaskAssigned(event)

    case 'task.updated':
      return handleTaskUpdated(event)

    case 'task.completed':
      return handleTaskCompleted(event)

    default:
      console.log('[NOTIFICATION] ignored event:', event.type)
  }
}

startConsumer(handleEvent)
