# SmartBus — MERN Stack Crowd-Powered Bus Occupancy Tracker

A VS Code-ready intermediate MERN project starter. Passengers can browse demo bus routes, submit crowd-level reports, and view recent crowd reports. Includes an Express API, MongoDB persistence, and optional Socket.IO live updates.

## Requirements
- Node.js 18+ (20+ recommended)
- MongoDB local instance or MongoDB Atlas connection string
- VS Code

## Project structure
```text
smartbus-mern/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── server/                 # Express + MongoDB + Socket.IO API
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── app.js
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## 1. Open in VS Code
Extract the ZIP file, open the `smartbus-mern` folder in VS Code, then open Terminal → New Terminal.

## 2. Configure backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set `MONGODB_URI`. Example for local MongoDB:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smartbus
CLIENT_ORIGIN=http://localhost:5173
```
Seed the demo buses:
```bash
npm run seed
```
Start the backend:
```bash
npm run dev
```
The API runs at `http://localhost:5000`.

## 3. Configure frontend
Open a second VS Code terminal:
```bash
cd client
npm install
```
Copy `.env.example` to `.env` (defaults to `http://localhost:5000`), then run:
```bash
npm run dev
```
Open the local URL shown by Vite, usually `http://localhost:5173`.

## Features
- Demo bus routes and stops
- Search buses by number, route name, origin, or destination
- Crowd reports: Low / Medium / High
- Report freshness and number of reports shown
- Recent reports for each bus
- Socket.IO broadcasts report updates when backend and client are running
- Responsive dashboard UI

## Important notes
- Crowd values are user-submitted estimates, not verified occupancy measurements.
- Demo bus routes are fictional sample data. Replace them with verified local transit data before real-world use.
- This starter intentionally does not include login, maps, or live GPS feeds yet. Add those as next development steps.
