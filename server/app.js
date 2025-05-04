import 'dotenv/config';

import express from 'express';

const app = express();

app.use(express.json());

import session from 'express-session';

app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));

import testRouter from './routers/testRouter.js';
app.use(testRouter);

import authRouter from './routers/authRouter.js';
app.use(authRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port:", PORT));