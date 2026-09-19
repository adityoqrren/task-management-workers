import amqp from 'amqplib'

export const startConsumer = async (onMessage) => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL)
  const channel = await conn.createChannel()

  await channel.assertExchange('domain-events', 'topic', {
    durable: true
  })

  const q = await channel.assertQueue('activity-logs-worker-queue', {
    durable: true
  })

  await channel.bindQueue(q.queue, 'domain-events', 'project.#') // # catches all separated by .
  await channel.bindQueue(q.queue, 'domain-events', 'task.*') // * just can detect one word after .

  console.log("Activity logs worker running...");

  channel.consume(q.queue, async (msg) => {
    console.log(`message: ${msg}`);
    if (!msg) return

    try {
      const event = JSON.parse(msg.content.toString())
      await onMessage(event)
      channel.ack(msg)
    } catch (err) {
      console.error('[ACTIVITY_LOGS_WORKER_ERROR]', err)
      channel.nack(msg, false, false) // drop dulu (simple)
    }
  })
};
