A production-grade, microservices-based uptime monitoring system — built to handle 1,000+ URLs with high-concurrency worker scaling.

![Architecture](./Architecture.png)

---

##  Why This Exists

Most uptime monitors are monoliths — one server polls URLs, sends alerts, and stores results. That works until it doesn't: one slow URL times out and blocks the entire queue, or a spike in registered sites takes down the whole service.

**Distributed Monitor** solves this by splitting every concern into its own independent service — capable of monitoring 1,000+ URLs concurrently via a Redis-backed BullMQ task queue. Each service can fail, restart, or scale independently without taking down the rest of the system.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      client-service (Next.js)                │
│             Dashboard UI + API Interaction                   │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│                       monitor-service                        │
│    Stores results → detects status changes → sends alerts    │
│               PostgreSQL (via PgBouncer + Prisma)            │
└──────────────────────────────▲───────────────────────────────┘
                               │
┌──────────────────────────────┴───────────────────────────────┐
│                       worker-service                         │
│       Consumes tasks → pings URLs → handles timeouts         │
└──────────────────────────────▲───────────────────────────────┘
                               │
                       BullMQ + Redis
                   (Distributed Task Queue)
                               ▲
                               │
┌──────────────────────────────┴───────────────────────────────┐
│                      scheduler-service                       │
│           Cron jobs → pushes check tasks to queue            │
└──────────────────────────────────────────────────────────────┘

        (Autoscaler monitors queue length & scales workers)
```

---

## ⚙️ Services

### `client-service`
- **Next.js** based dashboard for real-time monitoring and management
- Displays uptime status, response times, and incident history
- Communicates with the `monitor-service` via REST API

### `monitor-service`
- Persists all check results to PostgreSQL via Prisma ORM
- Detects status transitions (UP → DOWN, DOWN → UP)
- Triggers email alerts on status changes
- Exposes REST API for dashboard consumption

### `worker-service`
- Consumes tasks from the BullMQ queue concurrently
- Pings target URLs with configurable timeout handling
- Records response time, HTTP status, and reachability
- Designed to run multiple instances for horizontal scaling

### `scheduler-service`
- Manages cron jobs for every registered URL
- Determines check frequency per site
- Pushes lightweight check tasks into the BullMQ queue
- Completely stateless — no DB access needed

### `autoscaler-service`
- Monitors BullMQ queue depth (waiting jobs)
- Dynamically scales `worker-service` up or down using the Docker Engine API
- Prevents monitoring lag during traffic spikes and saves resources during idle periods


--

---

## 🛠️ Tech Stack

- **Frontend**: Next.js , Tailwind CSS, Lucide React
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL + PgBouncer (connection pooling)
- **Task Queue**: BullMQ + Redis 7
- **Orchestration**: Docker + Docker Compose
- **Alerting**: Nodemailer (SMTP)

---

## 📈 What This Demonstrates

- **Distributed Systems Design** — decoupled producer/consumer architecture
- **High Concurrency** — capable of monitoring 1,000+ URLs via distributed workers
- **Asynchronous Processing** — non-blocking task execution with BullMQ
- **Fault Tolerance** — automatic job retries, service-level isolation
- **Containerization** — multi-service Docker Compose orchestration
- **Production Thinking** — separation of concerns, independent scalability

