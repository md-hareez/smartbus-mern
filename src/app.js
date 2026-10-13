import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import busRoutes from './routes/buses.js';
import reportRoutes from './routes/reports.js';

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const io = new Server(server, {
  cors: { origin: allowedOrigin, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '200kb' }));
app.use((req, _res, next) => { req.io = io; next(); });

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'SmartBus API' }));
app.use('/api/buses', busRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Check the server terminal.' });
});

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI. Copy server/.env.example to server/.env and configure it.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => server.listen(port, () => console.log(`SmartBus API running at http://localhost:${port}`)))
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
