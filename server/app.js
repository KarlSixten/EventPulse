import 'dotenv/config';

import express from 'express';

const app = express();

import testRouter from './routers/testRouter.js';
app.use(testRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Server is running on port:", PORT));