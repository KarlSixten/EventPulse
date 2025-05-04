import db from './connection.js';

const deleteMode = process.argv.includes('--delete');

if (deleteMode) {
    await db.query(`DROP TABLE IF EXISTS users`);
}

await db.query(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)`);