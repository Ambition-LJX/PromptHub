# PromptHub - AI Prompt Management System

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A modern, full-featured AI prompt management and collaboration platform**

[English](README_EN.md) | [中文](README.md)

</div>

---

## Features

### Prompt Management
- **Multi-dimensional tagging** - by language (TS/JS/Python/Go...), role (frontend/backend/fullstack...), stage (requirements/architecture/coding/testing...)
- **Favorites & Search** - title and content keyword search with debounced input
- **Variable highlighting** - auto-detect and highlight `{{variable}}` syntax
- **Version history** - track every revision of a prompt
- **One-click copy** - copy prompt content to clipboard instantly
- **Sharing** - three visibility levels: PRIVATE, TEAM, SHARED

### Project Templates
- Chain multiple prompts into complete workflow templates
- Drag-and-drop reordering of prompts in the pipeline
- One-click generation of full prompt chains (Markdown export)
- Built-in 8 default development stage templates

### Workspaces
- Group related prompts together
- One-click Markdown export at workspace level
- Drag-and-drop organization

### Team Collaboration
- Create teams, invite members, assign roles (OWNER / MEMBER)
- Share prompts, project templates, and workspaces within teams
- Fine-grained access control

### UI & Themes
- 11 beautifully crafted glassmorphism themes
- Dark/light mode toggle
- Responsive layout with grid/list view toggle
- Smooth transitions and micro-interactions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 |
| Database | MySQL 8.0 + Prisma ORM |
| Auth | JWT (jose) + bcryptjs |
| UI Components | Radix UI Primitives |
| Styling | Tailwind CSS v4 + CSS Variables |
| Icons | Lucide React |
| Utils | cva / clsx / tailwind-merge |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+ or SQLite (dev)
- npm / yarn / pnpm

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database connection:

```env
DATABASE_URL="mysql://root:password@localhost:3306/prompt_hub"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

> **Note**: For MySQL, create the database first:
> ```sql
> CREATE DATABASE prompt_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> ```

### Initialize the database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data (admin account + sample prompts)
npm run db:seed
```

> Default admin: `admin@prompthub.local` / `password123`

### Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:studio  # Open Prisma Studio
```

---

## API Reference

### Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user |

### Prompts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prompts` | GET, POST | List / Create prompts |
| `/api/prompts/[id]` | GET, PUT, DELETE | CRUD for a single prompt |
| `/api/prompts/tags` | GET | Get all tags |
| `/api/prompts/picker` | GET | Prompt picker |
| `/api/prompts/[id]/share` | POST | Share a prompt |

### Project Templates

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET, POST | List / Create projects |
| `/api/projects/[id]` | GET, PUT, DELETE | CRUD for a single project |
| `/api/projects/[id]/chain` | GET | Get prompt chain |
| `/api/projects/[id]/share` | POST | Share a project |
| `/api/projects/stages/[stageId]` | PUT, DELETE | Stage operations |

### Workspaces

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workspaces` | GET, POST | List / Create workspaces |
| `/api/workspaces/[id]` | GET, PUT, DELETE | CRUD for a workspace |
| `/api/workspaces/lightweight` | GET | Lightweight workspace list |
| `/api/workspaces/[id]/share` | POST | Share a workspace |

### Teams

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET, POST | List / Create teams |
| `/api/teams/[id]` | GET, DELETE | View / Delete a team |
| `/api/teams/[id]/members` | GET, POST, DELETE | Team member management |

---

## Built-in Themes

| Theme | Description |
|-------|-------------|
| Deep Space | Deep blue cosmic theme |
| Aurora Light | Fresh and bright aurora |
| Rose Quartz | Soft pink-purple tones |
| Emerald Forest | Natural green palette |
| Sunset Orange | Warm orange sunset |
| Cyberpunk | Neon purple-green |
| Arctic Blue | Cold tech blue |
| Lavender Dream | Dreamy purple-gray |
| Mint Fresh | Crisp green-white |
| Golden Hour | Golden-brown warmth |
| Midnight Purple | Elegant dark purple |

---

## License

MIT License - see [LICENSE](LICENSE).
