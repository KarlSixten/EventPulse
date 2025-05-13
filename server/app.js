import 'dotenv/config';

import express from 'express';

const app = express();

app.use(express.json());

import cors from 'cors';
app.use(cors({
  origin: true, 
  credentials: true
}));

import session from 'express-session';
app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

import authRouter from './routers/authRouter.js';
app.use(authRouter);

import eventRouter from './routers/eventRouter.js';
app.use(eventRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port:", PORT));