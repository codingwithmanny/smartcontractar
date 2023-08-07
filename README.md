# SmartContractAR

A debugging, state visualization, and notification tool for SmartWeave contracts.

The following projects uses the following technologies:

- **NextJS** - serverless backend
- **ViteJS** - SPA frontend
- **Upstash.com QStash** - cronjobs
- **Resend.com** - email notifications
- **MailHog** - local email server testing

---

## Requirements

- NVM or Node.js v18.16.1
- Docker (local development only)
- Upstash.com QStash Account (for production)
- Resend.com Account (for production)

---

## Installation

### Local Development

```bash
# FROM: ./

pnpm install;
cp .env.example .env;
```

### Start Docker Services

```bash
# FROM: ./

pnpm db:up;
# To destroy all: pnpm db:down;
```

### Run Migrations

```bash
# FROM: ./

pnpm db:migrate --latest;
# rollback: pnpm db:migrate --down;
# forward: pnpm db:migrate --up;
```

### Run Email Test

```bash
# FROM: ./

pnpm email:test;
# Check: http://localhost:8025
```

### Run Apps

```bash
# FROM: ./

pnpm dev;
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

---

built by [@codingwithmanny](https://twitter.com/codingwithmanny)


