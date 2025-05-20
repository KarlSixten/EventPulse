import 'dotenv/config';

import express from 'express';
const app = express();

app.use(express.json());

import cors from 'cors';
const corsMiddleware = cors({
  origin: true, 
  credentials: true
});
app.use(corsMiddleware);

import session from 'express-session'
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});
app.use(sessionMiddleware);

import { createServer } from 'http';
const httpServer = createServer(app);

import { Server } from 'socket.io';
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
  const session = socket.request.session;

  if (session && session.user && session.user.id) {
    const userId = session.user.id;
    const roomName = userId.toString();

    socket.join(roomName);

  } else {
    socket.disconnect(true);
  }
});

import authRouter from './routers/auth/authRouter.js';
app.use(authRouter);

import eventRouter from './routers/events/eventRouter.js';
app.use(eventRouter);

export { io };

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log("Server is running on port:", PORT));