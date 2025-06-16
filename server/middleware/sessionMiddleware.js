import session from 'express-session';
import { ConnectSessionKnexStore } from 'connect-session-knex';
import knexPool from '../database/connection.js';

const store = new ConnectSessionKnexStore({
  knex: knexPool,
  tablename: 'sessions',
  createtable: true,
});

export default session({
  store,
  secret: process.env.SESSIONSECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
});
