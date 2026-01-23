# Real‑Time QR Attendance with Device Permissions

## Overview
- Real‑time socket communication between students and teachers.
- Requests camera and location permissions on the client.
- Scans QR, captures GPS, marks attendance, and runs proxy detection.
- Live UI updates for teachers.

## Backend Setup
1) Install Socket.IO:
```bash
cd backend
npm install socket.io
```
Or replace `package.json` with `backend/package.json.socket` and run `npm install`.

2) Start the backend:
```bash
npm run dev
```
You should see:
```
🚀 Server running on http://localhost:5000
🔌 Socket.IO enabled
```

## Frontend Setup
1) Install dependencies:
```bash
cd frontend
npm install socket.io-client html5-qrcode
```
Or replace `package.json` with `frontend/package.json.live` and run `npm install`.

2) Add routes (optional, already in `App.tsx.live`):
- `/live-attendance` – Student live attendance page
- `/session/:sessionId` – Teacher live session view

3) Start the frontend:
```bash
npm run dev
```

## How It Works

### Student Flow
1) Open `/live-attendance`.
2) App requests camera and location permissions.
3) Tap “Scan QR Code” → camera opens.
4) Scan QR → GPS captured.
5) Socket emits `mark-attendance` with QR token and location.
6) Backend validates QR, marks attendance, runs proxy detection in background.
7) Student sees “Attendance marked successfully”.

### Teacher Flow
1) Create an attendance session (existing endpoint).
2) Open `/session/:sessionId`.
3) See live list of students as they mark attendance.
4) Can close the session; all participants are notified.

### Socket Events
- `join-session` – Join a session (teacher or student)
- `mark-attendance` – Student marks attendance (includes GPS)
- `attendance-success` / `attendance-error` – Response to student
- `attendance-marked` – Broadcast to session with student info
- `close-session` – Teacher closes session
- `session-closed` – Broadcast to session

### Permissions
- Camera: Required for QR scanning.
- Location: Required for geofence and proxy detection.
- Both are requested gracefully; if denied, UI shows instructions.

## Notes
- Proxy detection runs in background after attendance is marked.
- All socket rooms are namespaced by `session:${sessionId}`.
- Frontend shows connection status (Wi‑Fi icon).
- If Socket.IO disconnects, it auto‑reconnects with exponential backoff.

## Troubleshooting
- **Camera not allowed**: Enable camera in browser settings.
- **Location not allowed**: Enable location in browser settings; use HTTPS for production.
- **Socket not connecting**: Ensure backend runs on `http://localhost:5000` and CORS allows your frontend origin.

Enjoy real‑time, permission‑driven attendance!
