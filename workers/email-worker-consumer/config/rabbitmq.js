import amqp from "amqplib";

export async function connectRabbitMQ() {
  const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
  const channel = await connection.createChannel();

  return { connection, channel };
}
