import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { createServer } from 'http';

import { initSocket } from './socket.js';

import authRouter from './routers/auth/authRouter.js';
import eventRouter from './routers/events/eventRouter.js';

const app = express();

app.use(express.json());

const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});
app.use(corsMiddleware);

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
  },
});
app.use(sessionMiddleware);

const httpServer = createServer(app);

initSocket(httpServer, sessionMiddleware);

app.use(authRouter);

app.use(eventRouter);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port: ${PORT}`);
});
