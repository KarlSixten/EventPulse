import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import { initSocket } from './socket.js';
import authRouter from './routers/auth/authRouter.js';
import eventRouter from './routers/events/eventRouter.js';

const prodMode = process.argv.includes('--prod');

const app = express();

app.use(express.json());

const corsMiddleware = cors({
  origin: 'http://localhost:5173',
  credentials: true,
});
app.use(corsMiddleware);

const sessionMiddleware = session({
  secret: process.env.SESSIONSECRET,
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

app.use('/api/auth', authRouter);

app.use('/api/events/', eventRouter);

if (prodMode) {
  app.use(express.static(path.resolve('../client/dist/')));

  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.resolve('../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port:', PORT);
});
