import 'dotenv/config';
import { Pool } from 'pg';

const pgPool = new Pool();

export { pgPool };

import knex from 'knex';
import knexConfig from '../knexfile.js';

const knexPool = knex(knexConfig);

export default knexPool;