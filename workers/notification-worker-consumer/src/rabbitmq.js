import amqp from 'amqplib'

export const startConsumer = async (onMessage) => {
  console.log(`running in env ${process.env.NODE_ENV}`)
  const conn = await amqp.connect(process.env.RABBITMQ_URL)
  const channel = await conn.createChannel()

  await channel.assertExchange('domain-events', 'topic', {
    durable: true
  })

  const q = await channel.assertQueue('notification-worker-queue', {
    durable: true
  })

  await channel.bindQueue(q.queue, 'domain-events', 'project.#') // # catches all separated by .
  await channel.bindQueue(q.queue, 'domain-events', 'task.#') // # matches all task.* events

  console.log("Notification worker running...");

  channel.consume(q.queue, async (msg) => {
    console.log(`message: ${msg}`);
    if (!msg) return

    try {
      const event = JSON.parse(msg.content.toString())
      await onMessage(event)
      channel.ack(msg)
    } catch (err) {
      console.error('[NOTIFICATION_WORKER_ERROR]', err)
      channel.nack(msg, false, false) // drop dulu (simple)
    }
  })
};
