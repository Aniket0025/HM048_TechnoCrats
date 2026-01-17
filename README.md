# HackMatrix

## Overview

HackMatrix is a full-stack web application with a React (Vite + TypeScript) frontend and a Node.js (Express) backend.

## Repository structure

- **frontend/**
  - React + TypeScript app powered by Vite
- **backend/**
  - Node.js + Express API server

## Prerequisites

- Node.js (recommended: 18+)
- npm

## Setup

### 1) Frontend

```sh
cd frontend
npm i
npm run dev
```

- **Dev server**: started by Vite (see console output for the URL)

### 2) Backend

```sh
cd backend
npm i
npm run dev
```

- Starts the backend with `nodemon` using `server.js`.

## Configuration (Environment Variables)

This repo does not currently include any `.env` files.

If your backend requires configuration (e.g., MongoDB connection string, port), create a `backend/.env` and load it via `dotenv` (already listed as a dependency).

Common examples:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hackmatrix
```

## Common scripts

### Frontend (`frontend/package.json`)

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Lint
- `npm run test` - Run tests

### Backend (`backend/package.json`)

- `npm run dev` - Start API server with nodemon

## Notes

- If you change dependencies, re-run `npm i` in the relevant folder.
- Keep `node_modules/` out of version control.

## License

See repository license information (if provided).
