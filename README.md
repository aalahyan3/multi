# Real-time Chat Platform

A simple real-time messaging app built with Next.js, Prisma, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- Google OAuth authentication
- User profiles with custom bio and colors
- Private chat rooms
- User search functionality
- Message history

## Tech Stack

- Next.js 14
- Prisma ORM
- PostgreSQL (Neon)
- Socket.IO
- Google OAuth
- JWT tokens

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon)
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/aalahyan3/multi.git
cd multi
npm install
```

### Environment Setup

Create `.env`:

```env
DATABASE_URL="postgresql://user:pass@host/db"
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
JWT_SECRET="your-jwt-secret"
CALLBACK_URI="uri for google oauth callback"
SOCKET_SERVER_URL="url for ur socket server, in this project is same as the next app"
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
```

### Running Locally

```bash
npm run dev
```

Open http://localhost:3000


### see ho it looks
https://multichat.up.railway.app
