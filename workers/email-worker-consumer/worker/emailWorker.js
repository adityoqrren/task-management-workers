import amqp from "amqplib";
import nodemailer from "nodemailer";
import 'dotenv/config';
import { connectRabbitMQ } from "../config/rabbitmq.js";

const EMAIL_QUEUE = "email.queue";
const EMAIL_RETRY_QUEUE = "email.retry.queue";
const EMAIL_DLQ = "email.dlq";

const MAX_RETRY = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds

async function startWorker() {
  const { channel } = await connectRabbitMQ();

  // Main queue
  await channel.assertQueue(EMAIL_QUEUE, {
    durable: true,
    deadLetterExchange: "",
    deadLetterRoutingKey: EMAIL_RETRY_QUEUE,
  });

  // Retry queue (TTL)
  await channel.assertQueue(EMAIL_RETRY_QUEUE, {
    durable: true,
    messageTtl: RETRY_DELAY_MS, // wait for 5000 ms until retry
    deadLetterExchange: "",
    deadLetterRoutingKey: EMAIL_QUEUE, // after 5000 ms move message to main queue
  });

  // Dead Letter Queue
  await channel.assertQueue(EMAIL_DLQ, {
    durable: true,
  });

  console.log("Email worker running...");

  channel.prefetch(1);

  // Setup Mailtrap
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });


  channel.consume(
    EMAIL_QUEUE,
    async (msg) => {
      if (!msg) return;
      const data = JSON.parse(msg.content.toString());
      const headers = msg.properties.headers || {};
      const retryCount = headers["x-retry-count"] || 0;
      console.log("Processing email:", data);

      try {
        console.log(`📩 Processing email to ${data.to}, retry=${retryCount}`);

        // await transporter.sendMail({
        //   from: '"Task Manager" <noreply@taskapp.com>',
        //   to: data.to,
        //   subject: data.subject,
        //   text: data.text,
        // });

        console.log("Email sent to", data.to);

        channel.ack(msg);
      } catch (err) {
        console.log(`error: ${err}`);
        if (isNonRetryableError(err)) {
          channel.ack(msg); // non retryable → throw away
        } else {
          if (retryCount >= MAX_RETRY) {
            console.log("☠️ Retry exhausted → DLQ");

            channel.sendToQueue(
              EMAIL_DLQ,
              msg.content,
              { headers }
            );

            channel.ack(msg);
          } else {
            console.log("🔁 Retry → retry queue");

            channel.sendToQueue(
              EMAIL_RETRY_QUEUE,
              msg.content,
              {
                headers: {
                  ...headers,
                  "x-retry-count": retryCount + 1,
                },
                persistent: true,
              }
            );

            channel.ack(msg);
          }
        }
      }
    },
    // noAck is used because we want to set ack and nack for error condition
    // ack : message is deleted permanently
    // nack : for failed message, we can choose if it must retry or go to DLQ (dead letter queue) -> queue for saving all failed message
    { noAck: false }
  );
}

startWorker();

function isNonRetryableError(err) {
  const message = err.message?.toLowerCase() || "";

  // Auth / config errors
  if (message.includes("authentication failed")) return true;
  if (message.includes("invalid login")) return true;
  if (message.includes("bad credentials")) return true;
  if (message.includes("username and password not accepted")) return true;

  // Payload / code error
  if (message.includes("no recipients defined")) return true;
  if (message.includes("missing credentials")) return true;

  return false; // the rests are retryable
}

