# Task Management Workers

Background services for a task management platform. The API publishes domain
events to RabbitMQ; these workers consume them to write audit logs, create
notifications, and send emails. A WebSocket gateway pushes notifications to
signed-in users in real time through Redis pub/sub.

This repository contains only the asynchronous/back-office side. The API that
produces events and owns the database is a separate project.

## Architecture

```
API ──publish──▶ RabbitMQ (exchange: domain-events, topic)
                       │
        ┌──────────────┼───────────────────┐
        ▼              ▼                   ▼
  activity-logs    notification        email
    worker           worker            worker
        │              │                  │
   PostgreSQL      PostgreSQL        SMTP server
                       │ (publish)
                       ▼
                     Redis pub/sub ──▶ WebSocket gateway ──▶ Browser
```

- **Domain events** are routed by type pattern (`project.#`, `task.#`).
- **Activity logs worker** persists one audit row per event.
- **Notification worker** stores notifications and publishes them to a
  per-user Redis channel (`notifications:user:<userId>`).
- **WebSocket gateway** authenticates the connection with a JWT, subscribes to
  that user's Redis channel, and forwards notifications. It also handles
  heartbeats and token expiry.
- **Email worker** sends messages from the `email.queue` with retry/TTL and a
  dead-letter queue for permanent failures.

## Components

| Path | Role |
| --- | --- |
| `rabbitmq-docker/` | Local RabbitMQ broker (Docker Compose) |
| `websocket/task-management-websocket/` | WebSocket gateway + Redis subscriber |
| `workers/activity-logs-worker-consumer/` | Writes `activityLogs` audit records |
| `workers/notification-worker-consumer/` | Writes notifications + Redis publish |
| `workers/email-worker-consumer/` | SMTP delivery with retries and DLQ |

Each worker is an independent Node.js service with its own `package.json`.

## Event types

**Projects:** `project.created`, `project.updated`, `project.archived`,
`project.unarchived`, `project.deleted`, `project.restored`,
`project.permanent.deleted`, `project.member.added`,
`project.member.deactivated`, `project.member.reactivated`

**Tasks:** `task.created`, `task.updated`, `task.assigned`, `task.unassigned`,
`task.completed`, `task.archived`, `task.unarchived`, `task.deleted`,
`task.restored`, `task.permanent.deleted`, `task.archived.by_project`,
`task.unarchived.by_project`, `task.comment.created`,
`task.comment.updated`, `task.comment.deleted`, `task.attachment.added`,
`task.attachment.deleted`

Events that are purely audit trails (cascade archive/unarchive) are ignored by
the notification worker.

## Data model (Prisma / PostgreSQL)

- **ActivityLogs** – `eventId` (unique), `type`, `actorId`, `targetUserId`,
  `entityType`, `entityId`, `projectId`, `taskId`, `message`.
- **Notifications** – `eventId`, `type`, `recipientId`, `actorId`, `title`,
  `message`, `isRead`, unique on `(eventId, recipientId)`.
- **ProjectMembers** – read-only mirror used for recipient resolution.

The workers share the API's database and **do not run migrations**. Schema
changes belong to the API project.

## Prerequisites

- Node.js 20+
- Docker (for RabbitMQ) and an accessible RabbitMQ instance
- PostgreSQL database (same one the API uses)
- Redis for the WebSocket gateway
- An SMTP account for the email worker

## Getting started

1. Start RabbitMQ:

   ```bash
   cd rabbitmq-docker
   cp .env.example .env   # then set your own credentials
   docker compose up -d
   ```

   Dashboard: http://localhost:15672 (AMQP on `5672`).

2. Configure each service with its own environment file (`.env` or
   `.env.dev` / `.env.production`). See the variable list below.

3. Install dependencies and run a worker:

   ```bash
   cd workers/notification-worker-consumer
   npm install
   npm run dev
   ```

   Run `npm start` (or `npm run dev:production`) in production.

## Environment variables

Names only — never commit real values. Keep secrets in `.env` files that are
git-ignored and rotate any key that may have leaked.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NODE_ENV` | all | Runtime mode |
| `RABBITMQ_URL` | workers | AMQP connection string |
| `DATABASE_URL` | activity-log, notification | PostgreSQL connection |
| `REDIS_SERVER`, `REDIS_PORT` | websocket, notification | Redis host/port |
| `WS_TOKEN_SECRET` | websocket | JWT verification secret |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | email | SMTP delivery |
| `RABBITMQ_DEFAULT_USER`, `RABBITMQ_DEFAULT_PASS` | broker | Local broker credentials |

> Security: `.env` files must stay out of version control. If any credential
> was ever committed, treat it as compromised and rotate it. Production TLS
> uses the bundled CA certificate (`cert/ca.pem`).

## Security notes

- The WebSocket gateway requires a valid JWT (`?token=`) and closes the socket
  on missing, invalid, or expired tokens.
- Database connections use TLS in production with a pinned CA.
- RabbitMQ must be reachable only by trusted services; use strong credentials
  and a private network.
- Notification channels are namespaced per user, so a subscriber only receives
  messages for its own `userId`.

## License

ISC
