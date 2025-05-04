import db from './connection.js';

const deleteMode = process.argv.includes('--delete');

console.log('Setting up database...');
console.log(`Delete mode is ${deleteMode ? "enabled" : "disabled"}.`);


try {
    if (deleteMode) {
        console.log('Dropping users table...');
        await db.query(`DROP TABLE IF EXISTS users CASCADE`);
        console.log('Users table dropped.');
    }

    console.log('Creating users table if it does not exist...');
    await db.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)`);
    console.log('Users table created or already exists.');

} catch (error) {
    console.log("Error while setting up database:", error);
} finally {
    console.log('Closing database connection pool...');
    await db.end();
    console.log('Database connection pool closed.');
}