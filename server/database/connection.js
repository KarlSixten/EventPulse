import 'dotenv/config';
import { Pool } from 'pg';

import knex from 'knex';
import knexConfig from '../util/knexfile.js';

const pgPool = new Pool();

export { pgPool };

const knexPool = knex(knexConfig);

export default knexPool;
